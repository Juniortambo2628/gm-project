<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Notify all admin users.
     *
     * @param string $type
     * @param string $title
     * @param string $message
     * @param array<string, mixed> $metadata
     * @return void
     */
    public function notifyAdmins(string $type, string $title, string $message, array $metadata = []): void
    {
        try {
            $admins = User::where('role', 'admin')->get();

            foreach ($admins as $admin) {
                Notification::create([
                    'user_id' => $admin->id,
                    'type' => $type,
                    'title' => $title,
                    'message' => $message,
                    'metadata' => $metadata,
                    'is_read' => false,
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Failed to notify admins ({$type}): " . $e->getMessage());
        }
    }
}
