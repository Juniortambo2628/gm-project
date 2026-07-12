<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\Setting;
use App\Services\MailDeliveryService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class InquiryController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService,
        protected MailDeliveryService $mailDeliveryService
    ) {}

    /**
     * Store a new contact message.
     */
    public function store(StoreMessageRequest $request): JsonResponse
    {
        $validated = $request->validated();

        try {
            $message = Message::create($validated);

            $this->notificationService->notifyAdmins(
                'inquiry',
                'New Client Inquiry Received',
                "{$message->name} has submitted a new inquiry regarding " . ($message->subject ?: 'Coaching') . ".",
                [
                    'inquiry_id' => $message->id,
                    'email' => $message->email,
                    'country' => $message->country,
                ]
            );

            $adminEmail = Setting::get('contact_email', 'admin@gathonimwai.com');

            $this->mailDeliveryService->send($adminEmail, 'inquiry_received', [
                'name' => $message->name,
                'email' => $message->email,
                'subject' => $message->subject ?: 'General Coaching Inquiry',
                'country' => $message->country ?: 'N/A',
                'message' => nl2br(e($message->content)),
            ]);

            $this->mailDeliveryService->send($message->email, 'inquiry_auto_reply', [
                'name' => $message->name,
                'subject' => $message->subject ?: 'your inquiry',
            ]);

            return response()->json([
                'status' => 'success',
                'message' => 'Message sent successfully. We will get back to you shortly.',
                'data' => new MessageResource($message),
            ], 201);
        } catch (\Exception $e) {
            Log::error('Failed to store inquiry: ' . $e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while processing your request.',
            ], 500);
        }
    }

    /**
     * List all inquiries (Admin).
     */
    public function index(): JsonResponse
    {
        $messages = Message::query()->latest()->paginate(15);

        return MessageResource::collection($messages)->response();
    }

    /**
     * Show a single inquiry (Admin).
     */
    public function show($id): JsonResponse
    {
        $message = Message::query()->findOrFail($id);

        return (new MessageResource($message))->response();
    }

    /**
     * Mark an inquiry as read (Admin).
     */
    public function markAsRead($id): JsonResponse
    {
        $message = Message::query()->findOrFail($id);
        $message->update(['is_read' => true]);

        return response()->json([
            'message' => 'Inquiry marked as read',
            'data' => new MessageResource($message),
        ]);
    }

    /**
     * Delete an inquiry (Admin).
     */
    public function destroy($id): JsonResponse
    {
        $message = Message::query()->findOrFail($id);
        $message->delete();

        return response()->json(['message' => 'Message deleted successfully']);
    }
}
