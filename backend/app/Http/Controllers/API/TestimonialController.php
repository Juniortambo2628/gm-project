<?php

namespace App\Http\Controllers\API;

use App\Http\Requests\StoreTestimonialRequest;
use App\Http\Requests\UpdateTestimonialRequest;
use App\Http\Resources\TestimonialResource;
use App\Models\Testimonial;

class TestimonialController extends BaseCrudController
{
    protected string $modelClass = Testimonial::class;

    protected string $resourceClass = TestimonialResource::class;

    protected ?string $storeRequestClass = StoreTestimonialRequest::class;

    protected ?string $updateRequestClass = UpdateTestimonialRequest::class;

    protected ?int $perPage = 15;
}
