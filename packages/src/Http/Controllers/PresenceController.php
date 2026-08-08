<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\PresenceServiceInterface;
use Illuminate\Http\Request;

class PresenceController extends Controller
{
    public function __construct(
        protected PresenceServiceInterface $presence,
    ) {}

    public function heartbeat(Request $request)
    {
        $this->presence->heartbeat($request->user()->getAuthIdentifier());

        return response()->noContent();
    }

    public function show(Request $request, int $userId)
    {
        $viewerUserId = $request->user()?->getAuthIdentifier();

        return response()->json(['data' => $this->presence->status($userId, $viewerUserId)]);
    }
}
