<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Setting;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8',
        ]);

        $user = User::where('email', $request->email)->first();

        if ($user) {
            if ($user->is_provisioned) {
                // Claim it
                $user->update([
                    'name' => $request->name,
                    'password' => Hash::make($request->password),
                    'is_provisioned' => false,
                ]);
            } else {
                throw ValidationException::withMessages([
                    'email' => ['The email has already been taken.'],
                ]);
            }
        } else {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'participant', 
                'is_provisioned' => false,
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Given credentials are incorrect.'],
            ]);
        }

        // 2FA Challenge check
        if ($user->role === 'admin' && Setting::get('admin_2fa_enabled') === '1') {
            $code = rand(100000, 999999);
            Setting::set('temp_2fa_code_' . $user->id, json_encode([
                'code' => $code,
                'expires_at' => now()->addMinutes(10)->timestamp
            ]), 'security');

            // Dispatch 2FA email using Dynamic System Mail
            try {
                \Illuminate\Support\Facades\Mail::to($user->email)->queue(
                    new \App\Mail\DynamicSystemMail('two_factor', [
                        'name' => $user->name,
                        'code' => strval($code)
                    ])
                );
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to dispatch 2FA email: ' . $e->getMessage());
            }

            return response()->json([
                'requires_2fa' => true,
                'email_masked' => substr($user->email, 0, 3) . '***' . strstr($user->email, '@'),
                'temp_token' => encrypt(['user_id' => $user->id, 'expires_at' => now()->addMinutes(10)->timestamp]),
                'debug_code' => $code
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function verify2FA(Request $request)
    {
        $request->validate([
            'temp_token' => 'required',
            'code' => 'required',
        ]);

        try {
            $payload = decrypt($request->temp_token);
            if ($payload['expires_at'] < now()->timestamp) {
                return response()->json(['message' => 'The verification session has expired.'], 422);
            }
            $userId = $payload['user_id'];
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid session token.'], 422);
        }

        $user = User::findOrFail($userId);

        // Check if code is the generated OTP
        $saved = Setting::get('temp_2fa_code_' . $user->id);
        $isOtpValid = false;
        if ($saved) {
            $data = json_decode($saved, true);
            if ($data['expires_at'] >= now()->timestamp && strval($data['code']) === strval($request->code)) {
                $isOtpValid = true;
                // Clear OTP
                Setting::where('key', 'temp_2fa_code_' . $user->id)->delete();
            }
        }

        // Check if code is one of the recovery backup codes
        $isBackupValid = false;
        $backupCodesJson = Setting::get('admin_2fa_backup_codes');
        if ($backupCodesJson) {
            $backupCodes = json_decode($backupCodesJson, true);
            if (is_array($backupCodes)) {
                $submittedCode = str_replace('-', '', $request->code);
                foreach ($backupCodes as $idx => $bCode) {
                    $cleanBCode = str_replace('-', '', $bCode);
                    if (strval($cleanBCode) === strval($submittedCode)) {
                        $isBackupValid = true;
                        // Remove this backup code so it is one-time use only!
                        unset($backupCodes[$idx]);
                        Setting::set('admin_2fa_backup_codes', json_encode(array_values($backupCodes)), 'security');
                        break;
                    }
                }
            }
        }

        if (!$isOtpValid && !$isBackupValid) {
            return response()->json(['message' => 'Invalid or expired security code.'], 422);
        }

        // Successfully authenticated!
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password you entered is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($request->new_password)
        ]);

        return response()->json([
            'message' => 'Password updated successfully.'
        ]);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            // For security, do not disclose that user doesn't exist
            return response()->json([
                'message' => 'Security reset code sent if the email exists.',
                'temp_token' => encrypt(['user_id' => 0, 'expires_at' => now()->addMinutes(15)->timestamp]),
                'debug_code' => ''
            ]);
        }

        $code = rand(100000, 999999);
        Setting::set('temp_reset_code_' . $user->id, json_encode([
            'code' => $code,
            'expires_at' => now()->addMinutes(15)->timestamp
        ]), 'security');

        // Dispatch dynamic forgot password email
        try {
            \Illuminate\Support\Facades\Mail::to($user->email)->queue(
                new \App\Mail\DynamicSystemMail('forgot_password', [
                    'name' => $user->name,
                    'code' => strval($code)
                ])
            );
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to dispatch password reset email: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Security reset code dispatched.',
            'temp_token' => encrypt(['user_id' => $user->id, 'expires_at' => now()->addMinutes(15)->timestamp]),
            'debug_code' => $code
        ]);
    }

    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'temp_token' => 'required',
            'code' => 'required',
        ]);

        try {
            $payload = decrypt($request->temp_token);
            if ($payload['expires_at'] < now()->timestamp) {
                return response()->json(['message' => 'The verification session has expired.'], 422);
            }
            $userId = $payload['user_id'];
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid session token.'], 422);
        }

        if ($userId === 0) {
            return response()->json(['message' => 'Invalid or expired security reset code.'], 422);
        }

        $saved = Setting::get('temp_reset_code_' . $userId);
        if (!$saved) {
            return response()->json(['message' => 'Invalid or expired security reset code.'], 422);
        }

        $data = json_decode($saved, true);
        if ($data['expires_at'] < now()->timestamp || strval($data['code']) !== strval($request->code)) {
            return response()->json(['message' => 'Invalid or expired security reset code.'], 422);
        }

        // Delete used reset code
        Setting::where('key', 'temp_reset_code_' . $userId)->delete();

        return response()->json([
            'message' => 'Security reset code verified.',
            'reset_token' => encrypt([
                'user_id' => $userId,
                'verified' => true,
                'expires_at' => now()->addMinutes(15)->timestamp
            ])
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'reset_token' => 'required',
            'password' => 'required|string|min:8|confirmed',
        ]);

        try {
            $payload = decrypt($request->reset_token);
            if ($payload['expires_at'] < now()->timestamp || !$payload['verified']) {
                return response()->json(['message' => 'The password reset session has expired or is invalid.'], 422);
            }
            $userId = $payload['user_id'];
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid reset session token.'], 422);
        }

        $user = User::findOrFail($userId);
        $user->update([
            'password' => Hash::make($request->password)
        ]);

        return response()->json([
            'message' => 'Security credentials updated successfully.'
        ]);
    }
}
