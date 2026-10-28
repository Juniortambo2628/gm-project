<?php

namespace App\Http\Controllers\API;

use App\Http\Resources\MailLogResource;
use App\Models\MailLog;
use Illuminate\Http\JsonResponse;

class MailLogController extends BaseCrudController
{
    protected string $modelClass = MailLog::class;

    protected string $resourceClass = MailLogResource::class;

    public function index(): JsonResponse
    {
        $this->perPage = 20;

        $query = MailLog::query();

        $request = request();
        if ($search = trim((string) $request->query('q'))) {
            $query->where(fn ($builder) => $builder->where('recipient', 'like', "%{$search}%")
                ->orWhere('subject', 'like', "%{$search}%"));
        }
        if ($templateKey = $request->query('template_key')) {
            $query->where('template_key', $templateKey);
        }
        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }
        if ($from = $request->query('from')) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to = $request->query('to')) {
            $query->whereDate('created_at', '<=', $to);
        }

        $items = $query->latest()->paginate($this->perPage);

        return MailLogResource::collection($items)->response();
    }

    public function show($id): JsonResponse
    {
        $mailLog = MailLog::query()->findOrFail($id);

        return (new MailLogResource($mailLog))->response();
    }
}
