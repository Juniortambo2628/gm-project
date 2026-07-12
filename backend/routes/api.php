<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\BlogController;
use App\Http\Controllers\API\CMSController;
use App\Http\Controllers\API\ContentController;
use App\Http\Controllers\API\DashboardController;
use App\Http\Controllers\API\InquiryController;
use App\Http\Controllers\API\MailTemplateController;
use App\Http\Controllers\API\NotificationController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\CalendlyWebhookController;
use App\Http\Controllers\API\PaystackWebhookController;
use App\Http\Controllers\API\PaymentVerificationController;
use App\Http\Controllers\API\IntegrationTestController;
use App\Http\Controllers\API\SettingController;
use App\Http\Controllers\API\UserController;

Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:10,1')->name('login');
Route::post('/login/verify-2fa', [AuthController::class, 'verify2FA'])->middleware('throttle:10,1');
Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:5,1');
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode'])->middleware('throttle:10,1');
Route::post('/reset-password', [AuthController::class, 'resetPassword'])->middleware('throttle:5,1');

// Public Content
Route::get('/site-content', [ContentController::class, 'index']);
Route::get('/services', [ContentController::class, 'services']);
Route::get('/services/{id}', [ContentController::class, 'service']);
Route::get('/faqs', [ContentController::class, 'faqs']);
Route::get('/blog', [ContentController::class, 'blog']);
Route::get('/blog/{slug}', [ContentController::class, 'blogShow']);
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/settings/{key}', [SettingController::class, 'getByKey']);
Route::post('/messages', [InquiryController::class, 'store'])->middleware('throttle:10,1');
Route::post('/transactions', [OrderController::class, 'store'])->middleware('throttle:10,1');
Route::post('/payments/verify', [PaymentVerificationController::class, 'verify']);

// Paystack webhook (called by Paystack servers, not by users)
Route::post('/webhooks/paystack', [PaystackWebhookController::class, 'handle'])
    ->name('webhooks.paystack');

// Calendly webhook (called by Calendly servers when events are booked/cancelled)
Route::post('/webhooks/calendly', [CalendlyWebhookController::class, 'handle'])
    ->name('webhooks.calendly');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return response()->json(new \App\Http\Resources\UserResource($request->user()));
    });
    Route::put('/user', [AuthController::class, 'updateProfile']);
    Route::get('/user/bookings', [OrderController::class, 'userBookings']);
    Route::get('/user/bookings/{id}', [OrderController::class, 'showUserBooking']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Admin endpoints
    Route::middleware('admin')->group(function () {
        // CMS Management
        Route::post('/cms/settings', [CMSController::class, 'updateSettings']);
        Route::post('/cms/upload', [CMSController::class, 'uploadFile']);
        Route::post('/cms/upload/metadata', [CMSController::class, 'fileMetadata']);
        Route::post('/cms/upload/download', [CMSController::class, 'downloadFile']);
        Route::post('/cms/upload/position', [CMSController::class, 'updatePosition']);

        // Live Notification Management
        Route::get('/cms/notifications', [NotificationController::class, 'index']);
        Route::post('/cms/notifications/{id}/read', [NotificationController::class, 'read']);
        Route::post('/cms/notifications/read-all', [NotificationController::class, 'readAll']);

        Route::post('/cms/services', [CMSController::class, 'saveService']);
        Route::put('/cms/services/{id}', [CMSController::class, 'updateService']);
        Route::delete('/cms/services/{id}', [CMSController::class, 'deleteService']);

        Route::post('/cms/faqs', [CMSController::class, 'saveFaq']);
        Route::put('/cms/faqs/{id}', [CMSController::class, 'updateFaq']);
        Route::delete('/cms/faqs/{id}', [CMSController::class, 'deleteFaq']);

        Route::post('/cms/testimonials', [CMSController::class, 'saveTestimonial']);
        Route::put('/cms/testimonials/{id}', [CMSController::class, 'updateTestimonial']);
        Route::delete('/cms/testimonials/{id}', [CMSController::class, 'deleteTestimonial']);

        // Dashboard Analytics
        Route::get('/cms/dashboard', [DashboardController::class, 'index']);

        // Integration Testing
        Route::get('/cms/integrations', [IntegrationTestController::class, 'index']);
        Route::post('/cms/integrations/test/{key}', [IntegrationTestController::class, 'test']);
        Route::post('/cms/integrations/test-all', [IntegrationTestController::class, 'testAll']);

        // Email Template Management
        Route::get('/cms/mail-templates', [MailTemplateController::class, 'index']);
        Route::get('/cms/mail-templates/{key}', [MailTemplateController::class, 'show']);
        Route::put('/cms/mail-templates/{key}', [MailTemplateController::class, 'update']);
        Route::get('/cms/mail-templates/{key}/preview', [MailTemplateController::class, 'preview']);
        Route::post('/cms/mail-templates/{key}/reset', [MailTemplateController::class, 'reset']);

        // Blog Management
        Route::get('/cms/blog', [BlogController::class, 'index']);
        Route::post('/cms/blog', [BlogController::class, 'store']);
        Route::get('/cms/blog/{id}', [BlogController::class, 'show']);
        Route::put('/cms/blog/{id}', [BlogController::class, 'update']);
        Route::delete('/cms/blog/{id}', [BlogController::class, 'destroy']);

        // Inquiry Management
        Route::get('/cms/inquiries', [InquiryController::class, 'index']);
        Route::get('/cms/inquiries/{id}', [InquiryController::class, 'show']);
        Route::post('/cms/inquiries/{id}/read', [InquiryController::class, 'markAsRead']);
        Route::delete('/cms/inquiries/{id}', [InquiryController::class, 'destroy']);

        // Order/Transaction Management
        Route::get('/cms/orders', [OrderController::class, 'index']);
        Route::get('/cms/orders/{id}', [OrderController::class, 'show']);
        Route::put('/cms/orders/{id}/status', [OrderController::class, 'updateStatus']);

        // User Management CRUD
        Route::get('/cms/users', [UserController::class, 'index']);
        Route::post('/cms/users', [UserController::class, 'store']);
        Route::get('/cms/users/{id}', [UserController::class, 'show']);
        Route::put('/cms/users/{id}', [UserController::class, 'update']);
        Route::put('/cms/users/{id}/role', [UserController::class, 'updateRole']);
        Route::delete('/cms/users/{id}', [UserController::class, 'destroy']);

        // Legacy System Settings
        Route::post('/settings', [SettingController::class, 'update']);
    });
});
