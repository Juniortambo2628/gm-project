<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\IntegrationTestResultResource;
use App\Models\IntegrationTestResult;
use App\Services\IntegrationTestService;
use App\Services\MailDeliveryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntegrationTestController extends Controller
{
    public function __construct(
        protected IntegrationTestService $testService,
        protected MailDeliveryService $mailDeliveryService
    ) {
    }

    public function index(): JsonResponse
    {
        $results = IntegrationTestResult::orderBy('name')->get();

        if ($results->isEmpty()) {
            $this->testService->all();
            $results = IntegrationTestResult::orderBy('name')->get();
        }

        return response()->json(IntegrationTestResultResource::collection($results));
    }

    public function test(string $key): JsonResponse
    {
        $result = $this->testService->test($key);

        return response()->json([
            'data' => $result,
        ]);
    }

    public function testAll(): JsonResponse
    {
        $results = $this->testService->all();

        return response()->json([
            'data' => $results,
        ]);
    }

    /**
     * Send a test email to the specified address to verify SMTP delivery.
     */
    public function sendTestEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'template_key' => 'nullable|string',
        ]);

        $email = $request->input('email');
        $templateKey = $request->input('template_key', 'welcome');

        try {
            $result = $this->mailDeliveryService->sendTest($email, $templateKey, [
                'name' => 'Test User',
                'code' => '123456',
                'amount' => 'KES 2,500.00',
                'service_name' => 'Test Coaching Session',
                'transaction_id' => 'TEST-REF-001',
                'date' => now()->addDays(2)->format('F d, Y'),
                'time' => '10:00 AM (EAT)',
                'duration' => '60 minutes',
                'subject' => 'Test Inquiry',
                'country' => 'Kenya',
                'message' => 'This is a test email sent from the admin integrations page.',
                'admin_url' => config('app.frontend_url', config('app.url')) . '/admin',
            ]);

            return response()->json([
                'success' => $result['success'],
                'message' => $result['success']
                    ? "Test email ({$templateKey}) sent successfully to {$email}."
                    : "Failed to send test email to {$email}.",
                'data' => $result,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error sending test email: ' . $e->getMessage(),
            ], 500);
        }
    }
}

