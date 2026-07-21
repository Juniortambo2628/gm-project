<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\StoreServiceRequest;
use App\Http\Requests\UpdateServiceRequest;
use App\Http\Resources\ServiceResource;
use App\Models\Service;

class ServiceController extends BaseCrudController
{
    protected string $modelClass = Service::class;
    protected string $resourceClass = ServiceResource::class;
    protected ?string $storeRequestClass = StoreServiceRequest::class;
    protected ?string $updateRequestClass = UpdateServiceRequest::class;
    protected ?int $perPage = 15;
}
