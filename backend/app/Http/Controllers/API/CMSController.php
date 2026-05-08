<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Faq;
use App\Models\Testimonial;

class CMSController extends Controller
{
    /**
     * Update bulk settings.
     */
    public function updateSettings(Request $request)
    {
        $settings = $request->input('settings', []);
        
        foreach ($settings as $key => $value) {
            \App\Models\Setting::set($key, $value);
        }

        return response()->json(['message' => 'Settings updated successfully']);
    }

    /**
     * Update or create a service.
     */
    public function saveService(Request $request)
    {
        $id = $request->input('id');
        $data = $request->only(['name', 'type', 'duration', 'price', 'description', 'features', 'is_active']);

        if ($id) {
            $service = \App\Models\Service::findOrFail($id);
            $service->update($data);
        } else {
            $service = \App\Models\Service::create($data);
        }

        return response()->json(['message' => 'Service saved successfully', 'service' => $service]);
    }

    /**
     * Delete a service.
     */
    public function deleteService($id)
    {
        \App\Models\Service::destroy($id);
        return response()->json(['message' => 'Service deleted successfully']);
    }

    /**
     * Upload a file and return the path.
     */
    public function uploadFile(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:jpeg,png,jpg,gif,svg,mp4,webm,ogg|max:10240',
            'key' => 'required|string'
        ]);

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $filename = time() . '_' . $file->getClientOriginalName();
            $path = $file->storeAs('public/cms', $filename);
            
            $url = \Illuminate\Support\Facades\Storage::url($path);
            
            // Save to settings automatically if key provided
            \App\Models\Setting::set($request->key, $url, 'media', $file->getClientMimeType());

            return response()->json([
                'message' => 'File uploaded successfully',
                'url' => $url,
                'path' => $path
            ]);
        }

        return response()->json(['error' => 'No file provided'], 400);
    }

    /**
     * Update or create a FAQ.
     */
    public function saveFaq(Request $request)
    {
        $id = $request->input('id');
        $data = $request->only(['question', 'answer', 'category', 'order']);

        if ($id) {
            $faq = Faq::findOrFail($id);
            $faq->update($data);
        } else {
            $faq = Faq::create($data);
        }

        return response()->json(['message' => 'FAQ saved successfully', 'faq' => $faq]);
    }

    /**
     * Delete a FAQ.
     */
    public function deleteFaq($id)
    {
        Faq::destroy($id);
        return response()->json(['message' => 'FAQ deleted successfully']);
    }

    /**
     * Update or create a Testimonial.
     */
    public function saveTestimonial(Request $request)
    {
        $id = $request->input('id');
        $data = $request->only(['client_name', 'client_role', 'content', 'portrait_path', 'is_featured', 'tag']);

        if ($id) {
            $testimonial = Testimonial::findOrFail($id);
            $testimonial->update($data);
        } else {
            $testimonial = Testimonial::create($data);
        }

        return response()->json(['message' => 'Testimonial saved successfully', 'testimonial' => $testimonial]);
    }

    /**
     * Delete a Testimonial.
     */
    public function deleteTestimonial($id)
    {
        Testimonial::destroy($id);
        return response()->json(['message' => 'Testimonial deleted successfully']);
    }
}
