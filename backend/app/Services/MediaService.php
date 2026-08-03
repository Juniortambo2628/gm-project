<?php

namespace App\Services;

use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class MediaService
{
    protected ImageManager $imageManager;

    protected int $maxFileSize = 20 * 1024 * 1024; // 20MB

    protected int $maxImageDimension = 2400;

    protected int $thumbnailDimension = 400;

    public function __construct()
    {
        $this->imageManager = new ImageManager(new Driver);
    }

    /**
     * Handle a file upload, compress images/videos, generate thumbnails, and persist to public storage.
     *
     * @return array{url: string, path: string, filename: string, mime: string, size: int, width: int|null, height: int|null, thumbnail_url: string|null}
     *
     * @throws \InvalidArgumentException
     */
    public function upload(Request $request): array
    {
        $file = $this->resolveFile($request);

        if (! $file instanceof UploadedFile || ! $file->isValid()) {
            throw new \InvalidArgumentException('The file field must be a valid uploaded file.');
        }

        $originalSize = $file->getSize();
        if ($originalSize > $this->maxFileSize) {
            $maxMb = round($this->maxFileSize / 1024 / 1024, 1);
            throw new \InvalidArgumentException("File size must not exceed {$maxMb}MB. Current size: ".round($originalSize / 1024 / 1024, 2).'MB.');
        }

        $mime = $file->getClientMimeType();
        $ext = strtolower($file->getClientOriginalExtension());

        $allowedMimes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif',
            'image/svg+xml', 'image/webp', 'image/avif',
            'video/mp4', 'video/webm', 'video/ogg',
        ];
        $allowedExts = ['jpeg', 'jpg', 'png', 'gif', 'svg', 'webp', 'avif', 'mp4', 'webm', 'ogg'];

        if (! in_array($mime, $allowedMimes) && ! in_array($ext, $allowedExts)) {
            throw new \InvalidArgumentException('Unsupported file format: '.$mime);
        }

        $filename = time().'_'.preg_replace('/[^a-zA-Z0-9._-]/', '_', $file->getClientOriginalName());
        $path = $file->storeAs('cms', $filename, 'public');
        $fullPath = Storage::disk('public')->path($path);

        $width = null;
        $height = null;
        $thumbnailUrl = null;

        if (str_starts_with($mime, 'image/') && $mime !== 'image/svg+xml') {
            $metadata = $this->compressImage($fullPath, $mime);
            $width = $metadata['width'] ?? null;
            $height = $metadata['height'] ?? null;

            $thumbnailPath = $this->generateThumbnail($fullPath, $mime);
            if ($thumbnailPath) {
                $thumbnailUrl = Storage::disk('public')->url($thumbnailPath);
            }
        }

        if (str_starts_with($mime, 'video/')) {
            $tempVideoPath = $fullPath.'_temp.mp4';
            if ($this->compressVideo($fullPath, $tempVideoPath)) {
                @unlink($fullPath);
                @rename($tempVideoPath, $fullPath);
            } else {
                @unlink($tempVideoPath);
            }

            $videoInfo = $this->getVideoDimensions($fullPath);
            $width = $videoInfo['width'] ?? null;
            $height = $videoInfo['height'] ?? null;
        }

        return [
            'url' => Storage::disk('public')->url($path),
            'path' => $path,
            'filename' => $filename,
            'mime' => Storage::disk('public')->mimeType($path) ?: $mime,
            'size' => Storage::disk('public')->size($path),
            'width' => $width,
            'height' => $height,
            'thumbnail_url' => $thumbnailUrl,
        ];
    }

    /**
     * Get metadata for an existing file without re-uploading.
     */
    public function getMetadata(string $path): array
    {
        $fullPath = Storage::disk('public')->path($path);

        if (! Storage::disk('public')->exists($path)) {
            throw new \InvalidArgumentException('File not found: '.$path);
        }

        try {
            $mime = Storage::disk('public')->mimeType($path);
            $size = Storage::disk('public')->size($path);
        } catch (\Exception $e) {
            Log::warning('Failed to read file metadata: '.$e->getMessage());

            throw new \InvalidArgumentException('Unable to read file metadata: '.$path);
        }

        $width = null;
        $height = null;

        if (str_starts_with($mime, 'image/') && $mime !== 'image/svg+xml') {
            try {
                $image = $this->imageManager->make($fullPath);
                $width = $image->width();
                $height = $image->height();
            } catch (\Exception $e) {
                $info = @getimagesize($fullPath);
                if ($info) {
                    $width = $info[0];
                    $height = $info[1];
                }
            }
        }

        return [
            'url' => Storage::disk('public')->url($path),
            'path' => $path,
            'mime' => $mime,
            'size' => $size,
            'width' => $width,
            'height' => $height,
        ];
    }

    private function resolveFile(Request $request): ?UploadedFile
    {
        if ($request->hasFile('file')) {
            return $request->file('file');
        }

        if ($request->files->has('file')) {
            return $request->files->get('file');
        }

        return null;
    }

    private function encodeImage($image, string $mimeType, int $quality)
    {
        return $image->encode($mimeType, $quality);
    }

    private function compressImage(string $sourcePath, string $mimeType): array
    {
        ini_set('memory_limit', '256M');

        try {
            $image = $this->imageManager->make($sourcePath);
            $originalWidth = $image->width();
            $originalHeight = $image->height();

            if ($originalWidth > $this->maxImageDimension || $originalHeight > $this->maxImageDimension) {
                $image->scaleDown($this->maxImageDimension);
            }

            $quality = match ($mimeType) {
                'image/png' => 7,
                'image/gif' => 0,
                'image/webp' => 82,
                'image/avif' => 75,
                default => 78,
            };

            $encoded = $this->encodeImage($image, $mimeType, $quality);
            $encoded->save($sourcePath);

            return [
                'width' => $image->width(),
                'height' => $image->height(),
            ];
        } catch (\Exception $e) {
            Log::warning('Intervention Image compression failed, falling back to GD: '.$e->getMessage());

            return $this->compressImageFallback($sourcePath, $mimeType);
        }
    }

    private function compressImageFallback(string $sourcePath, string $mimeType): array
    {
        $image = match ($mimeType) {
            'image/jpeg', 'image/jpg' => @imagecreatefromjpeg($sourcePath),
            'image/png' => @imagecreatefrompng($sourcePath),
            'image/gif' => @imagecreatefromgif($sourcePath),
            'image/webp' => @imagecreatefromwebp($sourcePath),
            default => null,
        };

        if (! $image) {
            return ['width' => null, 'height' => null];
        }

        $width = imagesx($image);
        $height = imagesy($image);

        if ($width > $this->maxImageDimension || $height > $this->maxImageDimension) {
            if ($width > $height) {
                $newWidth = $this->maxImageDimension;
                $newHeight = (int) ($height * ($this->maxImageDimension / $width));
            } else {
                $newHeight = $this->maxImageDimension;
                $newWidth = (int) ($width * ($this->maxImageDimension / $height));
            }

            $resized = imagecreatetruecolor($newWidth, $newHeight);
            if ($mimeType === 'image/png' || $mimeType === 'image/gif') {
                imagealphablending($resized, false);
                imagesavealpha($resized, true);
            }
            imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
            imagedestroy($image);
            $image = $resized;
            $width = $newWidth;
            $height = $newHeight;
        }

        $success = match ($mimeType) {
            'image/png' => imagepng($image, $sourcePath, 7),
            'image/gif' => imagegif($image, $sourcePath),
            'image/webp' => function_exists('imagewebp') ? imagewebp($image, $sourcePath, 80) : false,
            default => imagejpeg($image, $sourcePath, 75),
        };

        imagedestroy($image);

        return ['width' => $width, 'height' => $height];
    }

    private function generateThumbnail(string $sourcePath, string $mimeType): ?string
    {
        try {
            $image = $this->imageManager->make($sourcePath);
            $image->coverDown($this->thumbnailDimension, $this->thumbnailDimension);

            $ext = pathinfo($sourcePath, PATHINFO_EXTENSION);
            $thumbFilename = pathinfo($sourcePath, PATHINFO_FILENAME).'_thumb.'.$ext;
            $thumbPath = 'cms/'.$thumbFilename;

            $quality = match ($mimeType) {
                'image/png' => 7,
                'image/gif' => 0,
                'image/webp' => 80,
                'image/avif' => 70,
                default => 75,
            };

            $encoded = $this->encodeImage($image, $mimeType, $quality);
            $encoded->save(Storage::disk('public')->path($thumbPath));

            return $thumbPath;
        } catch (\Exception $e) {
            Log::warning('Thumbnail generation failed: '.$e->getMessage());

            return null;
        }
    }

    private function compressVideo(string $sourcePath, string $destinationPath): bool
    {
        if (! function_exists('shell_exec')) {
            return false;
        }

        $ffmpegCheck = @shell_exec('ffmpeg -version 2>&1');
        if (! $ffmpegCheck || (str_contains($ffmpegCheck, 'ffmpeg version') === false && str_contains($ffmpegCheck, 'FFmpeg') === false)) {
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

    private function getVideoDimensions(string $path): ?array
    {
        if (! function_exists('shell_exec')) {
            return null;
        }

        $cmd = sprintf(
            'ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 %s 2>&1',
            escapeshellarg($path)
        );

        $output = @shell_exec($cmd);
        if ($output && str_contains($output, ',')) {
            [$w, $h] = explode(',', trim($output));

            return ['width' => (int) $w, 'height' => (int) $h];
        }

        return null;
    }
}
