<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\PresenceServiceInterface;

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
