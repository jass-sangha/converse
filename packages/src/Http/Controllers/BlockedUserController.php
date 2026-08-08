<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\BlockedUserServiceInterface;
use Converse\Chat\Http\Requests\BlockUserRequest;
use Illuminate\Http\Request;

class BlockedUserController extends Controller
{
    public function __construct(
        protected BlockedUserServiceInterface $blockedUsers,
    ) {}

    public function index(Request $request)
    {
        $perPage = (int) config('chat.pagination.conversations_per_page', 30);

        return response()->json(
            $this->blockedUsers->listForUser($request->user()->getAuthIdentifier(), $perPage)
        );
    }

    public function store(BlockUserRequest $request)
    {
        $this->blockedUsers->block(
            $request->user()->getAuthIdentifier(),
            (int) $request->validated()['user_id'],
        );

        return response()->noContent();
    }

    public function destroy(Request $request, int $userId)
    {
        $this->blockedUsers->unblock($request->user()->getAuthIdentifier(), $userId);

        return response()->noContent();
    }
}
