<?php

namespace App\Services;

use App\Models\Appointment;
use Illuminate\Support\Facades\URL;

class AppointmentDocumentUploadLink
{
    public function for(Appointment $appointment): string
    {
        $apiUrl = URL::temporarySignedRoute(
            'appointments.documents.upload',
            now()->addMonths(6),
            ['appointment' => $appointment->id]
        );

        $query = parse_url($apiUrl, PHP_URL_QUERY);
        $frontendUrl = rtrim((string) config('services.frontend_url', config('app.url')), '/');

        return "{$frontendUrl}/appointment-documents/{$appointment->id}?{$query}";
    }
}
