<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\PresenceServiceInterface;
use Illuminate\Http\Request;

class PresenceController extends Controller
{
    public function __construct(
        protected PresenceServiceInterface $presence,
    ) {}

    public function heartbeat(Request $request)
    {
        $this->presence->heartbeat($request->user());

        return response()->noContent();
    }

    public function show(Request $request, string $chatableType, int $chatableId)
    {
        $chatable = Chat::resolveChatable($chatableType, $chatableId);

        return response()->json(['data' => $this->presence->status($chatable, $request->user())]);
    }
}
