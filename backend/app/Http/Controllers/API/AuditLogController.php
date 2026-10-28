<?php

namespace App\Http\Controllers\API;

use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController
{
    public function index(Request $request): JsonResponse
    {
        $query = AuditLog::query()->with('user')->latest('created_at');
        if ($search = trim((string) $request->query('q'))) {
            $query->where(function ($builder) use ($search) {
                $builder->where('action', 'like', "%{$search}%")
                    ->orWhere('subject_type', 'like', "%{$search}%")
                    ->orWhere('subject_id', 'like', "%{$search}%");
            });
        }

        return AuditLogResource::collection($query->paginate(25))->response();
    }
}
