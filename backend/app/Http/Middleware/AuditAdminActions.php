<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class AuditAdminActions
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        $route = $request->route();
        $isDownload = str_contains((string) $route?->uri(), 'download');
        $isMutation = in_array($request->method(), ['POST', 'PUT', 'PATCH', 'DELETE'], true);

        if (! $request->user() || (! $isMutation && ! $isDownload) || $response->getStatusCode() >= 400) {
            return $response;
        }

        try {
            $parameters = $route?->parameters() ?? [];
            $subjectType = array_key_first($parameters);
            $subject = $subjectType ? $parameters[$subjectType] : null;
            $subjectId = is_object($subject) && method_exists($subject, 'getKey')
                ? $subject->getKey()
                : (is_scalar($subject) ? (string) $subject : null);

            AuditLog::create([
                'user_id' => $request->user()->id,
                'action' => strtoupper($request->method()).' '.($route?->uri() ?? $request->path()),
                'subject_type' => $subjectType,
                'subject_id' => $subjectId,
                'status_code' => $response->getStatusCode(),
                'ip_address' => $request->ip(),
                'metadata' => ['route' => $route?->getName()],
                'created_at' => now(),
            ]);
        } catch (Throwable $exception) {
            Log::warning('Could not persist admin audit event', ['error' => $exception->getMessage()]);
        }

        return $response;
    }
}
