<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Resources\IntegrationTestResultResource;
use App\Models\IntegrationTestResult;
use App\Services\IntegrationTestService;
use Illuminate\Http\JsonResponse;

class IntegrationTestController extends Controller
{
    public function __construct(protected IntegrationTestService $testService)
    {
    }

    public function index(): JsonResponse
    {
        $results = IntegrationTestResult::orderBy('name')->get();

        if ($results->isEmpty()) {
            $this->testService->all();
            $results = IntegrationTestResult::orderBy('name')->get();
        }

        return response()->json(IntegrationTestResultResource::collection($results));
    }

    public function test(string $key): JsonResponse
    {
        $result = $this->testService->test($key);

        return response()->json([
            'data' => $result,
        ]);
    }

    public function testAll(): JsonResponse
    {
        $results = $this->testService->all();

        return response()->json([
            'data' => $results,
        ]);
    }
}
