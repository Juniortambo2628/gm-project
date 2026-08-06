<?php

namespace App\Http\Controllers\API;

use App\Http\Resources\MailLogResource;
use App\Models\MailLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MailLogController extends BaseCrudController
{
    protected string $modelClass = MailLog::class;
    protected string $resourceClass = MailLogResource::class;

    public function index(): JsonResponse
    {
        $this->perPage = 20;

        $query = MailLog::query();

        if ($request = request()) {
            if ($recipient = $request->input('recipient')) {
                $query->where('recipient', 'like', "%{$recipient}%");
            }
            if ($templateKey = $request->input('template_key')) {
                $query->where('template_key', $templateKey);
            }
            if ($status = $request->input('status')) {
                $query->where('status', $status);
            }
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
