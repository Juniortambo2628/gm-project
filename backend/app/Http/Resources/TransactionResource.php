<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TransactionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'service_id' => $this->service_id,
            'service' => new ServiceResource($this->whenLoaded('service')),
            'service_name' => $this->whenLoaded('service', fn () => $this->service?->name),
            'appointment' => $this->whenLoaded('appointment', fn () => $this->appointment ? [
                'id' => $this->appointment->id,
                'scheduled_at' => $this->appointment->scheduled_at?->toISOString(),
                'status' => $this->appointment->status,
                'documents' => $this->appointment->relationLoaded('documents')
                    ? $this->appointment->documents->map(fn ($document) => [
                        'id' => $document->id,
                        'name' => $document->original_name,
                        'size_bytes' => $document->size_bytes,
                        'created_at' => $document->created_at?->toISOString(),
                    ])
                    : [],
            ] : null),
            'stripe_payment_intent_id' => $this->stripe_payment_intent_id,
            'stripe_checkout_session_id' => $this->stripe_checkout_session_id,
            'status' => $this->status,
            'email_sent_at' => $this->email_sent_at?->toISOString(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
