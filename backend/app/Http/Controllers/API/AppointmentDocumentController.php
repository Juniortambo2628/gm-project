<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AppointmentDocument;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AppointmentDocumentController extends Controller
{
    public function status(Appointment $appointment): JsonResponse
    {
        return response()->json([
            'uploaded' => $appointment->documents()->count(),
            'limit' => 10,
            'documents' => $appointment->documents()->latest()->get()->map(fn (AppointmentDocument $document) => [
                'id' => $document->id,
                'name' => $document->original_name,
                'size_bytes' => $document->size_bytes,
                'created_at' => $document->created_at?->toISOString(),
            ]),
        ]);
    }

    public function store(Request $request, Appointment $appointment): JsonResponse
    {
        $request->validate([
            'documents' => 'required|array|min:1|max:5',
            'documents.*' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
        ]);

        if ($appointment->documents()->count() + count($request->file('documents')) > 10) {
            return response()->json(['message' => 'A maximum of 10 documents can be uploaded for this appointment.'], 422);
        }

        $saved = [];
        foreach ($request->file('documents') as $file) {
            $path = $file->store("appointment-documents/{$appointment->id}", 'local');
            $document = $appointment->documents()->create([
                'path' => $path,
                'original_name' => Str::limit(basename($file->getClientOriginalName()), 255, ''),
                'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
                'size_bytes' => $file->getSize(),
            ]);

            $saved[] = ['id' => $document->id, 'name' => $document->original_name];
        }

        return response()->json(['message' => 'Documents uploaded successfully.', 'data' => $saved], 201);
    }

    public function download(AppointmentDocument $document)
    {
        abort_unless(Storage::disk('local')->exists($document->path), 404);

        return Storage::disk('local')->download($document->path, $document->original_name, [
            'Content-Type' => $document->mime_type,
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function destroy(AppointmentDocument $document): JsonResponse
    {
        Storage::disk('local')->delete($document->path);
        $document->delete();

        return response()->json(['message' => 'Document deleted.']);
    }
}
