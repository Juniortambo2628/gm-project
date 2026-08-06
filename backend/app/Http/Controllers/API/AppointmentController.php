<?php

namespace App\Http\Controllers\API;

use App\Http\Resources\AppointmentResource;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController extends BaseCrudController
{
    protected string $modelClass = Appointment::class;
    protected string $resourceClass = AppointmentResource::class;

    public function index(): JsonResponse
    {
        $this->perPage = 15;

        return parent::index();
    }

    public function show($id): JsonResponse
    {
        $appointment = Appointment::query()
            ->with(['service', 'transaction'])
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

        return (new AppointmentResource($appointment->fresh(['service', 'transaction'])))->response();
    }

    public function destroy($id): JsonResponse
    {
        $appointment = Appointment::query()->findOrFail($id);
        $appointment->delete();

        return response()->json([
            'message' => 'Appointment deleted successfully.',
        ]);
    }
}
