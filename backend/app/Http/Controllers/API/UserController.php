<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    /**
     * List all users (Admin).
     */
    public function index()
    {
        $users = User::latest()->get();
        return response()->json($users);
    }

    /**
     * Update a user's role (Admin).
     */
    public function updateRole(Request $request, $id)
    {
        $validated = $request->validate([
            'role' => 'required|string|in:admin,user,participant'
        ]);

        $user = User::findOrFail($id);

        // Guard against self demotion
        if ($user->id === $request->user()->id && $validated['role'] !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'You cannot change your own admin access privileges.'
            ], 403);
        }

        $user->role = $validated['role'];
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => "User role updated to {$validated['role']}.",
            'data' => $user
        ]);
    }

    /**
     * Delete a user account (Admin).
     */
    public function destroy($id, Request $request)
    {
        $user = User::findOrFail($id);

        // Prevent deleting oneself
        if ($user->id === $request->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Self-deletion is blocked. Contact system admin if you need to close your account.'
            ], 403);
        }

        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User account deleted successfully.'
        ]);
    }
}
