<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class CMSController extends Controller
{
    public function __construct(protected MediaService $mediaService) {}

    /**
     * Update bulk settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $settings = $request->input('settings', []);

        foreach ($settings as $key => $value) {
            Setting::set($key, $value);
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    /**
     * Handle file uploads with compression and metadata.
     */
    public function uploadFile(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string',
        ]);

        try {
            $result = $this->mediaService->upload($request);

            Setting::set($request->input('key'), $result['url'], 'media', 'string');

            return response()->json([
                'message' => 'File uploaded successfully',
                'url' => $result['url'],
                'path' => $result['path'],
                'filename' => $result['filename'],
                'mime' => $result['mime'],
                'size' => $result['size'],
                'width' => $result['width'],
                'height' => $result['height'],
                'thumbnail_url' => $result['thumbnail_url'],
            ]);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 422);
        } catch (\Exception $e) {
            Log::error('Upload failed: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return response()->json(['error' => 'Upload failed: '.$e->getMessage()], 500);
        }
    }

    /**
     * Get metadata for an existing uploaded file.
     */
    public function fileMetadata(Request $request): JsonResponse
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        try {
            $metadata = $this->mediaService->getMetadata($request->input('path'));

            return response()->json($metadata);
        } catch (\InvalidArgumentException $e) {
            return response()->json(['error' => $e->getMessage()], 404);
        }
    }

    /**
     * Download an uploaded file.
     */
    public function downloadFile(Request $request): Response
    {
        $request->validate([
            'path' => 'required|string',
        ]);

        $path = $request->input('path');

        // Path traversal protection: reject paths with .. or that escape storage root
        $realStorageRoot = realpath(Storage::disk('public')->path(''));
        $requestedPath = realpath(Storage::disk('public')->path($path));

        if ($requestedPath === false || $realStorageRoot === false || str_starts_with($requestedPath, $realStorageRoot) === false) {
            abort(403, 'Access denied.');
        }

        if (! Storage::disk('public')->exists($path)) {
            abort(404, 'File not found.');
        }

        $fullPath = Storage::disk('public')->path($path);
        $filename = basename($path);

        return response()->download($fullPath, $filename, [
            'Content-Type' => Storage::disk('public')->mimeType($path),
        ]);
    }

    /**
     * Update image focal point / position for a setting key.
     */
    public function updatePosition(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string',
            'x' => 'required|numeric|between:0,100',
            'y' => 'required|numeric|between:0,100',
            'mobile_x' => 'nullable|numeric|between:0,100',
            'mobile_y' => 'nullable|numeric|between:0,100',
        ]);

        $position = [
            'x' => (float) $request->input('x'),
            'y' => (float) $request->input('y'),
        ];

        if ($request->has('mobile_x') && $request->has('mobile_y')) {
            $position['mobile_x'] = (float) $request->input('mobile_x');
            $position['mobile_y'] = (float) $request->input('mobile_y');
        }

        Setting::set($request->input('key').'_position', json_encode($position), 'media', 'json');

        return response()->json([
            'message' => 'Image position updated successfully',
            'position' => $position,
        ]);
    }
}
