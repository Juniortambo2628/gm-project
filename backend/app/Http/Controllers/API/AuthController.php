<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\ForgotPasswordRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\ResetPasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\Verify2FARequest;
use App\Http\Requests\VerifyResetCodeRequest;
use App\Http\Resources\UserResource;
use App\Models\Setting;
use App\Models\User;
use App\Services\MailDeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function __construct(protected MailDeliveryService $mailDeliveryService) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => 'participant',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $this->mailDeliveryService->send($user->email, 'welcome', [
            'name' => $user->name,
        ]);

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Given credentials are incorrect.'],
            ]);
        }

        // 2FA Challenge check
        if ($user->role === 'admin' && Setting::get('admin_2fa_enabled') === '1') {
            $code = rand(100000, 999999);
            Setting::set('temp_2fa_code_'.$user->id, json_encode([
                'code' => $code,
                'expires_at' => now()->addMinutes(10)->timestamp,
            ]), 'security');

            $this->mailDeliveryService->send($user->email, 'two_factor', [
                'name' => $user->name,
                'code' => strval($code),
            ]);

            return response()->json([
                'requires_2fa' => true,
                'email_masked' => substr($user->email, 0, 3).'***'.strstr($user->email, '@'),
                'temp_token' => encrypt(['user_id' => $user->id, 'expires_at' => now()->addMinutes(10)->timestamp]),
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }

    public function verify2FA(Verify2FARequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $payload = decrypt($validated['temp_token']);
            if ($payload['expires_at'] < now()->timestamp) {
                return response()->json(['message' => 'The verification session has expired.'], 422);
            }
            $userId = $payload['user_id'];
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid session token.'], 422);
        }

        $user = User::query()->findOrFail($userId);

        $isOtpValid = $this->isOtpValid($user->id, $validated['code']);
        $isBackupValid = $this->isBackupValid($validated['code']);

        if (! $isOtpValid && ! $isBackupValid) {
            return response()->json(['message' => 'Invalid or expired security code.'], 422);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => new UserResource($user),
        ]);
    }

    private function isOtpValid(int $userId, string $code): bool
    {
        $saved = Setting::get('temp_2fa_code_'.$userId);

        if (! $saved) {
            return false;
        }

        $data = json_decode($saved, true);
        if (! is_array($data)) {
            return false;
        }

        if ($data['expires_at'] >= now()->timestamp && strval($data['code']) === strval($code)) {
            Setting::where('key', 'temp_2fa_code_'.$userId)->delete();

            return true;
        }

        return false;
    }

    private function isBackupValid(string $code): bool
    {
        $backupCodesJson = Setting::get('admin_2fa_backup_codes');

        if (! $backupCodesJson) {
            return false;
        }

        $backupCodes = json_decode($backupCodesJson, true);
        if (! is_array($backupCodes)) {
            return false;
        }

        $submittedCode = str_replace('-', '', $code);

        foreach ($backupCodes as $idx => $bCode) {
            $cleanBCode = str_replace('-', '', $bCode);
            if (strval($cleanBCode) === strval($submittedCode)) {
                unset($backupCodes[$idx]);
                Setting::set('admin_2fa_backup_codes', json_encode(array_values($backupCodes)), 'security');

                return true;
            }
        }

        return false;
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        return response()->json([
            'message' => 'Profile updated successfully.',
            'user' => new UserResource($user),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $user = $request->user();

        if (! Hash::check($validated['current_password'], $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password you entered is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($validated['new_password']),
        ]);

        return response()->json([
            'message' => 'Password updated successfully.',
        ]);
    }

    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $email = $request->validated()['email'];
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            return response()->json([
                'message' => 'Security reset code sent if the email exists.',
                'temp_token' => encrypt(['user_id' => 0, 'expires_at' => now()->addMinutes(15)->timestamp]),
            ]);
        }

        $code = rand(100000, 999999);
        Setting::set('temp_reset_code_'.$user->id, json_encode([
            'code' => $code,
            'expires_at' => now()->addMinutes(15)->timestamp,
        ]), 'security');

        $this->mailDeliveryService->send($user->email, 'forgot_password', [
            'name' => $user->name,
            'code' => strval($code),
        ]);

        return response()->json([
            'message' => 'Security reset code dispatched.',
            'temp_token' => encrypt(['user_id' => $user->id, 'expires_at' => now()->addMinutes(15)->timestamp]),
        ]);
    }

    public function verifyResetCode(VerifyResetCodeRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $payload = decrypt($validated['temp_token']);
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

        $saved = Setting::get('temp_reset_code_'.$userId);
        if (! $saved) {
            return response()->json(['message' => 'Invalid or expired security reset code.'], 422);
        }

        $data = json_decode($saved, true);
        if ($data['expires_at'] < now()->timestamp || strval($data['code']) !== strval($validated['code'])) {
            return response()->json(['message' => 'Invalid or expired security reset code.'], 422);
        }

        Setting::where('key', 'temp_reset_code_'.$userId)->delete();

        return response()->json([
            'message' => 'Security reset code verified.',
            'reset_token' => encrypt([
                'user_id' => $userId,
                'verified' => true,
                'expires_at' => now()->addMinutes(15)->timestamp,
            ]),
        ]);
    }

    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $payload = decrypt($validated['reset_token']);
            if ($payload['expires_at'] < now()->timestamp || ! $payload['verified']) {
                return response()->json(['message' => 'The password reset session has expired or is invalid.'], 422);
            }
            $userId = $payload['user_id'];
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid reset session token.'], 422);
        }

        $user = User::query()->findOrFail($userId);
        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Security credentials updated successfully.',
        ]);
    }
}
