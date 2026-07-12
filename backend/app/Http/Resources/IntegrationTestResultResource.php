<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IntegrationTestResultResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'key' => $this->key,
            'name' => $this->name,
            'status' => $this->status,
            'configured' => $this->configured,
            'connected' => $this->connected,
            'message' => $this->message,
            'details' => $this->details ?? [],
            'tested_at' => $this->tested_at?->toISOString(),
        ];
    }
}
