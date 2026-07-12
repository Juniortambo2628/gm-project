<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    /**
     * Public-safe setting groups.
     */
    protected array $publicGroups = ['general', 'about', 'branding', 'communications', 'hero'];

    /**
     * Get all public-safe settings grouped by category.
     */
    public function index(): JsonResponse
    {
        $settings = Setting::query()
            ->whereIn('group', $this->publicGroups)
            ->get()
            ->groupBy('group');

        return response()->json($settings);
    }

    /**
     * Update or create settings (admin).
     */
    public function update(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => 'required|array',
        ]);

        foreach ($request->settings as $group => $items) {
            foreach ($items as $key => $value) {
                Setting::updateOrCreate(
                    ['key' => $key],
                    ['value' => $value, 'group' => $group]
                );
            }
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    /**
     * Get a specific public-safe setting by key.
     */
    public function getByKey($key): JsonResponse
    {
        $setting = Setting::query()->where('key', $key)->first();

        if (! $setting) {
            return response()->json(['message' => 'Setting not found.'], 404);
        }

        if (! in_array($setting->group, $this->publicGroups, true)) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return response()->json(['value' => $setting->value]);
    }
}
