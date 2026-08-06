<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'transaction_id' => $this->transaction_id,
            'service_id' => $this->service_id,
            'user_id' => $this->user_id,
            'client_name' => $this->client_name,
            'client_email' => $this->client_email,
            'scheduled_at' => $this->scheduled_at?->toISOString(),
            'duration_minutes' => $this->duration_minutes,
            'status' => $this->status,
            'reminder_sent_at' => $this->reminder_sent_at?->toISOString(),
            'followup_sent_at' => $this->followup_sent_at?->toISOString(),
            'notes' => $this->notes,
            'service' => new ServiceResource($this->whenLoaded('service')),
            'transaction' => new TransactionResource($this->whenLoaded('transaction')),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
