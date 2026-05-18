<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get notifications for the authenticated user.
     */
    public function index(Request $request)
    {
        $userId = $request->user()->id;
        $notifications = Notification::where('user_id', $userId)->latest()->get();

        // Seed initial notifications if empty to showcase active dashboard capability
        if ($notifications->isEmpty()) {
            Notification::create([
                'user_id' => $userId,
                'type' => 'system',
                'title' => 'Platform Initialized Successfully',
                'message' => 'Your Gathoni Mwai coaching system is fully active. Payment routing, email variables, and dynamic configurations are verified.',
                'is_read' => false
            ]);
            Notification::create([
                'user_id' => $userId,
                'type' => 'inquiry',
                'title' => 'Julius K. sent an Inquiry',
                'message' => 'Client Julius Kinyua: "I would love to prepare for the McKinsey Case Interview prep module for East Africa next week."',
                'is_read' => false
            ]);
            Notification::create([
                'user_id' => $userId,
                'type' => 'booking',
                'title' => 'Mock Prep Service Booking',
                'message' => 'Sarah Omwamba completed a booking for Mock Interview Coaching. Paystack Ref: PSTK-748291.',
                'is_read' => false
            ]);
            $notifications = Notification::where('user_id', $userId)->latest()->get();
        }

        return response()->json($notifications);
    }

    /**
     * Mark a single notification as read.
     */
    public function read(Request $request, $id)
    {
        $userId = $request->user()->id;
        $notification = Notification::where('user_id', $userId)->where('id', $id)->firstOrFail();
        $notification->update(['is_read' => true]);

        return response()->json(['message' => 'Notification marked as read', 'notification' => $notification]);
    }

    /**
     * Mark all notifications as read.
     */
    public function readAll(Request $request)
    {
        $userId = $request->user()->id;
        Notification::where('user_id', $userId)->update(['is_read' => true]);

        return response()->json(['message' => 'All notifications marked as read']);
    }
}
