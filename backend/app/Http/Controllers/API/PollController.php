<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Poll;
use App\Models\Response;

class PollController extends Controller
{
    /**
     * Display the specified poll with relations and authenticated user response.
     */
    public function show($id, Request $request)
    {
        $poll = Poll::with(['organization', 'questions.factor'])->find($id);

        if (!$poll) {
            return response()->json([
                'status' => 'error',
                'message' => 'Survey poll not found.'
            ], 404);
        }

        // Fetch authenticated user response if available
        $userResponse = null;
        if ($request->user()) {
            $userResponse = Response::where('user_id', $request->user()->id)
                ->where('poll_id', $id)
                ->first();
        }

        return response()->json([
            'status' => 'success',
            'poll' => $poll,
            'user_response' => $userResponse
        ]);
    }

    /**
     * Store or update a user's survey responses.
     */
    public function storeResponse(Request $request)
    {
        $validated = $request->validate([
            'poll_id' => 'required|exists:polls,id',
            'answers' => 'required|array'
        ]);

        $user = $request->user();

        // Verify if response updating is restricted
        $poll = Poll::findOrFail($validated['poll_id']);
        $existing = Response::where('user_id', $user->id)->where('poll_id', $poll->id)->first();

        if ($existing && !$poll->can_update_responses) {
            return response()->json([
                'status' => 'error',
                'message' => 'Responses are locked for this survey assessment and cannot be modified.'
            ], 403);
        }

        $response = Response::updateOrCreate(
            [
                'user_id' => $user->id,
                'poll_id' => $validated['poll_id']
            ],
            [
                'answers' => $validated['answers']
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Response recorded successfully!',
            'data' => $response
        ]);
    }
}
