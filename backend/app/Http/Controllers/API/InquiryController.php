<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Message;
use App\Models\Setting;
use Illuminate\Support\Facades\Mail;
use App\Mail\InquiryReceived;
use Illuminate\Support\Facades\Log;

class InquiryController extends Controller
{
    /**
     * Store a new contact message.
     */
    public function store(Request $request)
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
            
            // Try to find admin email from settings
            $adminEmailSetting = Setting::where('key', 'contact_email')->first();
            $adminEmail = $adminEmailSetting ? $adminEmailSetting->value : 'admin@gathonimwai.com';

            try {
                Mail::to($adminEmail)->queue(new InquiryReceived($message));
            } catch (\Exception $mailEx) {
                Log::error('Failed to send inquiry email (check SMTP credentials): ' . $mailEx->getMessage());
            }

            return response()->json([
                'status' => 'success',
                'message' => 'Message sent successfully. We will get back to you shortly.',
                'data' => $message
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => 'An error occurred while processing your request.'
            ], 500);
        }
    }

    /**
     * List all inquiries (Admin).
     */
    public function index()
    {
        $messages = Message::latest()->get();
        return response()->json($messages);
    }

    /**
     * Delete an inquiry (Admin).
     */
    public function destroy($id)
    {
        Message::destroy($id);
        return response()->json(['message' => 'Message deleted successfully']);
    }
}
