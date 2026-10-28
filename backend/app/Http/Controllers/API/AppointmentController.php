<?php

namespace App\Http\Controllers\API;

use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AppointmentController extends BaseCrudController
{
    protected string $modelClass = Appointment::class;

    protected string $resourceClass = AppointmentResource::class;

    public function index(Request $request): JsonResponse
    {
        $query = Appointment::query()->with(['service', 'documents', 'transaction'])->latest();
        if ($search = trim((string) $request->query('q'))) {
            $query->where(fn ($builder) => $builder->where('client_name', 'like', "%{$search}%")
                ->orWhere('client_email', 'like', "%{$search}%"));
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($request->query('documents') === 'uploaded') {
            $query->whereHas('documents');
        } elseif ($request->query('documents') === 'missing') {
            $query->whereDoesntHave('documents');
        }
        if ($from = $request->query('from')) {
            $query->whereDate('scheduled_at', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $query->whereDate('scheduled_at', '<=', $to);
        }
        $items = $query->paginate(15);

        return AppointmentResource::collection($items)->response();
    }

    public function show($id): JsonResponse
    {
        $appointment = Appointment::query()
            ->with(['service', 'transaction', 'documents'])
            ->findOrFail($id);

        return (new AppointmentResource($appointment))->response();
    }

    public function update(Request $request, $id): JsonResponse
    {
        $appointment = Appointment::query()->findOrFail($id);

        $data = $request->validate([
            'status' => 'sometimes|string|in:scheduled,completed,cancelled',
            'notes' => 'sometimes|string|nullable',
            'scheduled_at' => 'sometimes|date|nullable',
            'duration_minutes' => 'sometimes|integer|min:15|max:480',
        ]);

        $appointment->update($data);

        return (new AppointmentResource($appointment->fresh(['service', 'transaction', 'documents'])))->response();
    }

    public function destroy($id): JsonResponse
    {
        $appointment = Appointment::query()->with('documents')->findOrFail($id);
        foreach ($appointment->documents as $document) {
            Storage::disk('local')->delete($document->path);
        }
        $appointment->delete();

        return response()->json([
            'message' => 'Appointment deleted successfully.',
        ]);
    }
}
