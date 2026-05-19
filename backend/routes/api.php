<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\SettingController;
use App\Http\Controllers\API\ContentController;
use App\Http\Controllers\API\CMSController;
use App\Http\Controllers\API\InquiryController;
use App\Http\Controllers\API\OrderController;
use App\Http\Controllers\API\DashboardController;

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/login/verify-2fa', [AuthController::class, 'verify2FA']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('/reset-password', [AuthController::class, 'resetPassword']);

// Public Content
Route::get('/site-content', [ContentController::class, 'index']);
Route::get('/services', [ContentController::class, 'services']);
Route::get('/faqs', [ContentController::class, 'faqs']);
Route::get('/settings', [SettingController::class, 'index']);
Route::get('/settings/{key}', [SettingController::class, 'getByKey']);
Route::post('/messages', [InquiryController::class, 'store']);
Route::post('/transactions', [OrderController::class, 'store']);

Route::middleware('auth:sanctum')->group(function() {
    Route::get('/user', function (Request $request) {
        return response()->json($request->user());
    });
    Route::get('/user/bookings', [OrderController::class, 'userBookings']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::post('/change-password', [AuthController::class, 'changePassword']);

    // Admin endpoints
    Route::middleware('admin')->group(function() {
        // CMS Management
        Route::post('/cms/settings', [CMSController::class, 'updateSettings']);
        Route::post('/cms/upload', [CMSController::class, 'uploadFile']);
        
        // Live Notification Management
        Route::get('/cms/notifications', [\App\Http\Controllers\API\NotificationController::class, 'index']);
        Route::post('/cms/notifications/{id}/read', [\App\Http\Controllers\API\NotificationController::class, 'read']);
        Route::post('/cms/notifications/read-all', [\App\Http\Controllers\API\NotificationController::class, 'readAll']);
        Route::post('/cms/services', [CMSController::class, 'saveService']);
        Route::delete('/cms/services/{id}', [CMSController::class, 'deleteService']);
        Route::post('/cms/faqs', [CMSController::class, 'saveFaq']);
        Route::delete('/cms/faqs/{id}', [CMSController::class, 'deleteFaq']);
        Route::post('/cms/testimonials', [CMSController::class, 'saveTestimonial']);
        Route::delete('/cms/testimonials/{id}', [CMSController::class, 'deleteTestimonial']);

        // Dashboard Analytics
        Route::get('/cms/dashboard', [DashboardController::class, 'index']);

        // Blog Management
        Route::get('/cms/blog', [\App\Http\Controllers\API\BlogController::class, 'index']);
        Route::post('/cms/blog', [\App\Http\Controllers\API\BlogController::class, 'store']);
        Route::put('/cms/blog/{id}', [\App\Http\Controllers\API\BlogController::class, 'update']);
        Route::delete('/cms/blog/{id}', [\App\Http\Controllers\API\BlogController::class, 'destroy']);

        // Inquiry Management
        Route::get('/cms/inquiries', [InquiryController::class, 'index']);
        Route::delete('/cms/inquiries/{id}', [InquiryController::class, 'destroy']);

        // Order/Transaction Management
        Route::get('/cms/orders', [OrderController::class, 'index']);

        // Legacy System Settings
        Route::post('/settings', [SettingController::class, 'update']);
    });
});
