<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Requests\UpdateUserRoleRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class UserController extends BaseCrudController
{
    protected string $modelClass = User::class;
    protected string $resourceClass = UserResource::class;
    protected ?string $storeRequestClass = StoreUserRequest::class;
    protected ?string $updateRequestClass = UpdateUserRequest::class;
    protected ?int $perPage = 15;

    /**
     * Hash the password before saving. On update, drop empty passwords.
     */
    protected function beforeSave(array $data, ?Model $model): array
    {
        if (! empty($data['password'])) {
            $data['password'] = Hash::make($data['password']);
        } elseif ($model) {
            unset($data['password']);
        }

        return $data;
    }

    /**
     * Update a user's role (Admin).
     */
    public function updateRole(UpdateUserRoleRequest $request, $id): JsonResponse
    {
        $validated = $request->validated();
        $user = User::query()->findOrFail($id);

        // Guard against self demotion
        if ($user->id === $request->user()->id && $validated['role'] !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'You cannot change your own admin access privileges.',
            ], 403);
        }

        $user->role = $validated['role'];
        $user->save();

        return response()->json([
            'status' => 'success',
            'message' => "User role updated to {$validated['role']}.",
            'data' => new UserResource($user),
        ]);
    }

    /**
     * Delete a user account (Admin).
     */
    public function destroy($id): JsonResponse
    {
        $user = User::query()->findOrFail($id);

        // Prevent deleting oneself
        if ($user->id === request()->user()->id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Self-deletion is blocked. Contact system admin if you need to close your account.',
            ], 403);
        }

        $user->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'User account deleted successfully.',
        ]);
    }
}
