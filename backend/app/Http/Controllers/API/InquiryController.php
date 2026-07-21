<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Message;
use App\Models\Setting;
use App\Services\MailDeliveryService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class InquiryController extends BaseCrudController
{
    protected string $modelClass = Message::class;

    protected string $resourceClass = MessageResource::class;

    protected ?string $storeRequestClass = StoreMessageRequest::class;

    protected ?int $perPage = 15;

    public function __construct(
        protected NotificationService $notificationService,
        protected MailDeliveryService $mailDeliveryService
    ) {}

    /**
     * Store a new contact message with notifications and auto-reply.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'country' => 'nullable|string|max:255',
            'subject' => 'nullable|string|max:255',
            'content' => 'required|string',
        ]);

        try {
            $message = Message::create($validated);

            $this->notificationService->notifyAdmins(
                'inquiry',
                'New Client Inquiry Received',
                "{$message->name} has submitted a new inquiry regarding ".($message->subject ?: 'Coaching').'.',
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
            Log::error('Failed to store inquiry: '.$e->getMessage());

            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while processing your request.',
            ], 500);
        }
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
}
