<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Faq;
use App\Models\Testimonial;

class CMSController extends Controller
{
    /**
     * Update bulk settings.
     */
    public function updateSettings(Request $request)
    {
        $settings = $request->input('settings', []);
        
        foreach ($settings as $key => $value) {
            \App\Models\Setting::set($key, $value);
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    /**
     * Update or create a service.
     */
    public function saveService(Request $request)
    {
        $id = $request->input('id');
        $data = $request->only(['name', 'type', 'duration', 'price', 'description', 'features', 'is_active']);

        if ($id) {
            $service = \App\Models\Service::findOrFail($id);
            $service->update($data);
        } else {
            $service = \App\Models\Service::create($data);
        }

        return response()->json(['message' => 'Service saved successfully', 'service' => $service]);
    }

    /**
     * Delete a service.
     */
    public function deleteService($id)
    {
        \App\Models\Service::destroy($id);
        return response()->json(['message' => 'Service deleted successfully']);
    }

    public function uploadFile(Request $request)
    {
        // Extract the file directly from the files bag to prevent name-collision where FilePond/plugins send metadata string with same name 'file'
        $file = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
        } elseif ($request->files->has('file')) {
            $file = $request->files->get('file');
        }

        // Validate key
        $request->validate([
            'key' => 'required|string'
        ]);

        // Manually validate that a valid uploaded file exists
        if (!$file || !($file instanceof \Illuminate\Http\UploadedFile) || !$file->isValid()) {
            return response()->json(['error' => 'The file field must be a valid uploaded file.'], 422);
        }

        // Validate max size (25.6MB)
        if ($file->getSize() > 25600 * 1024) {
            return response()->json(['error' => 'The file size must not exceed 25.6MB.'], 422);
        }

        $mime = $file->getClientMimeType();
        $ext = strtolower($file->getClientOriginalExtension());

        // Programmatic MIME and extension check to prevent Windows server mismatched validation blocks
        $allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg'];
        $allowedExts = ['jpeg', 'jpg', 'png', 'gif', 'svg', 'webp', 'mp4', 'webm', 'ogg'];
        
        if (!in_array($mime, $allowedMimes) && !in_array($ext, $allowedExts)) {
            return response()->json(['error' => 'Unsupported file format: ' . $mime], 422);
        }

        $filename = time() . '_' . $file->getClientOriginalName();
        $path = $file->storeAs('cms', $filename, 'public');
        
        $fullPath = storage_path('app/public/' . $path);
        $mime = $file->getClientMimeType();

        // Compress Image (GD library)
        if (strpos($mime, 'image/') !== false) {
            $this->compressImage($fullPath, $fullPath, $mime);
        }

        // Compress Video (FFmpeg fallback)
        if (strpos($mime, 'video/') !== false) {
            $tempVideoPath = $fullPath . '_temp.mp4';
            if ($this->compressVideo($fullPath, $tempVideoPath)) {
                @unlink($fullPath);
                @rename($tempVideoPath, $fullPath);
            } else {
                @unlink($tempVideoPath);
            }
        }
        
        $url = \Illuminate\Support\Facades\Storage::disk('public')->url($path);
        
        // Save to settings automatically if key provided
        \App\Models\Setting::set($request->key, $url, 'media', $mime);

        return response()->json([
            'message' => 'File uploaded successfully',
            'url' => $url,
            'path' => $path
        ]);
    }

    private function compressImage($sourcePath, $destinationPath, $mimeType)
    {
        ini_set('memory_limit', '256M');

        switch ($mimeType) {
            case 'image/jpeg':
            case 'image/jpg':
                $image = @imagecreatefromjpeg($sourcePath);
                break;
            case 'image/png':
                $image = @imagecreatefrompng($sourcePath);
                break;
            case 'image/gif':
                $image = @imagecreatefromgif($sourcePath);
                break;
            case 'image/webp':
                $image = @imagecreatefromwebp($sourcePath);
                break;
            default:
                return false;
        }

        if (!$image) {
            return false;
        }

        $width = imagesx($image);
        $height = imagesy($image);

        $maxDimension = 1600;
        if ($width > $maxDimension || $height > $maxDimension) {
            if ($width > $height) {
                $newWidth = $maxDimension;
                $newHeight = intval($height * ($maxDimension / $width));
            } else {
                $newHeight = $maxDimension;
                $newWidth = intval($width * ($maxDimension / $height));
            }

            $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

            if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
                imagealphablending($resizedImage, false);
                imagesavealpha($resizedImage, true);
                $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
                imagefilledrectangle($resizedImage, 0, 0, $newWidth, $newHeight, $transparent);
            }

            imagecopyresampled($resizedImage, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $resizedImage;
        }

        $success = false;
        if ($mimeType === 'image/png') {
            $success = imagepng($image, $destinationPath, 7);
        } elseif ($mimeType === 'image/gif') {
            $success = imagegif($image, $destinationPath);
        } elseif (function_exists('imagewebp') && $mimeType === 'image/webp') {
            $success = imagewebp($image, $destinationPath, 80);
        } else {
            $success = imagejpeg($image, $destinationPath, 75);
        }

        imagedestroy($image);
        return $success;
    }

    private function compressVideo($sourcePath, $destinationPath)
    {
        if (!function_exists('shell_exec')) {
            return false;
        }

        $ffmpegCheck = @shell_exec('ffmpeg -version 2>&1');
        if (!$ffmpegCheck || (strpos($ffmpegCheck, 'ffmpeg version') === false && strpos($ffmpegCheck, 'FFmpeg') === false)) {
            return false;
        }

        $cmd = sprintf(
            'ffmpeg -y -i %s -vcodec libx264 -crf 28 -preset fast -acodec aac -b:a 128k -movflags +faststart %s 2>&1',
            escapeshellarg($sourcePath),
            escapeshellarg($destinationPath)
        );

        @exec($cmd, $output, $resultCode);

        return $resultCode === 0;
    }

    /**
     * Update or create a FAQ.
     */
    public function saveFaq(Request $request)
    {
        $id = $request->input('id');
        $data = $request->only(['question', 'answer', 'category', 'order']);

        if ($id) {
            $faq = Faq::findOrFail($id);
            $faq->update($data);
        } else {
            $faq = Faq::create($data);
        }

        return response()->json(['message' => 'FAQ saved successfully', 'faq' => $faq]);
    }

    /**
     * Delete a FAQ.
     */
    public function deleteFaq($id)
    {
        Faq::destroy($id);
        return response()->json(['message' => 'FAQ deleted successfully']);
    }

    /**
     * Update or create a Testimonial.
     */
    public function saveTestimonial(Request $request)
    {
        $id = $request->input('id');
        $data = $request->only(['client_name', 'client_role', 'content', 'portrait_path', 'is_featured', 'tag']);

        if ($id) {
            $testimonial = Testimonial::findOrFail($id);
            $testimonial->update($data);
        } else {
            $testimonial = Testimonial::create($data);
        }

        return response()->json(['message' => 'Testimonial saved successfully', 'testimonial' => $testimonial]);
    }

    /**
     * Delete a Testimonial.
     */
    public function deleteTestimonial($id)
    {
        Testimonial::destroy($id);
        return response()->json(['message' => 'Testimonial deleted successfully']);
    }
}
