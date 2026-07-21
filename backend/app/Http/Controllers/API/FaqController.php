<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\StoreFaqRequest;
use App\Http\Requests\UpdateFaqRequest;
use App\Http\Resources\FaqResource;
use App\Models\Faq;

class FaqController extends BaseCrudController
{
    protected string $modelClass = Faq::class;

    protected string $resourceClass = FaqResource::class;

    protected ?string $storeRequestClass = StoreFaqRequest::class;

    protected ?string $updateRequestClass = UpdateFaqRequest::class;

    protected ?int $perPage = 15;
}
