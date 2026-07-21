<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Validator;

abstract class BaseCrudController extends Controller
{
    /**
     * Eloquent model class for the resource.
     *
     * @var class-string<Model>
     */
    protected string $modelClass;

    /**
     * API resource class used to transform models.
     *
     * @var class-string<JsonResource>
     */
    protected string $resourceClass;

    /**
     * Form request class used for store operations.
     *
     * @var class-string<FormRequest>|null
     */
    protected ?string $storeRequestClass = null;

    /**
     * Form request class used for update operations.
     *
     * @var class-string<FormRequest>|null
     */
    protected ?string $updateRequestClass = null;

    /**
     * Number of items per page. Use null to disable pagination.
     */
    protected ?int $perPage = 15;

    public function index(): JsonResponse
    {
        $query = $this->modelClass::query();

        $items = $this->perPage !== null
            ? $query->latest()->paginate($this->perPage)
            : $query->latest()->get();

        return $this->resourceClass::collection($items)->response();
    }

    public function show($id): JsonResponse
    {
        $item = $this->modelClass::query()->findOrFail($id);

        return (new $this->resourceClass($item))->response();
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request, $this->storeRequestClass);
        $data = $this->beforeSave($data, null);

        $item = $this->modelClass::create($data);
        $this->afterSave($item, $data, null);

        return (new $this->resourceClass($item))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $item = $this->modelClass::query()->findOrFail($id);

        $data = $this->validated($request, $this->updateRequestClass);
        $data = $this->beforeSave($data, $item);

        $item->update($data);
        $this->afterSave($item, $data, null);

        return (new $this->resourceClass($item))->response();
    }

    public function destroy($id): JsonResponse
    {
        $item = $this->modelClass::query()->findOrFail($id);
        $item->delete();

        return response()->json([
            'message' => class_basename($this->modelClass) . ' deleted successfully.',
        ]);
    }

    /**
     * Hook called before saving data to the model. Override to transform input.
     *
     * @param array<string, mixed> $data
     * @param Model|null $model Null during store; populated during update.
     * @return array<string, mixed>
     */
    protected function beforeSave(array $data, ?Model $model): array
    {
        return $data;
    }

    /**
     * Hook called after the model has been saved.
     *
     * @param Model $model
     * @param array<string, mixed> $data
     * @param Model|null $previousModel
     */
    protected function afterSave(Model $model, array $data, ?Model $previousModel): void
    {
        //
    }

    /**
     * Validate the incoming request using the configured form request class,
     * or fall back to the raw input when no form request is configured.
     *
     * @param Request $request
     * @param class-string<FormRequest>|null $formRequestClass
     * @return array<string, mixed>
     */
    protected function validated(Request $request, ?string $formRequestClass): array
    {
        if ($formRequestClass) {
            $formRequest = new $formRequestClass();
            $formRequest->setContainer(app());

            if ($request->hasSession()) {
                $formRequest->setLaravelSession($request->session());
            }

            if ($route = $request->route()) {
                $formRequest->setRouteResolver(fn () => $route);

                foreach ($route->parameters() as $key => $value) {
                    $formRequest->route()->setParameter($key, $value);
                }
            }

            $validator = \Illuminate\Support\Facades\Validator::make(
                $request->all(),
                $formRequest->rules(),
                $formRequest->messages(),
                $formRequest->attributes()
            );

            $validator->validate();

            return $validator->validated();
        }

        return $request->all();
    }
}
