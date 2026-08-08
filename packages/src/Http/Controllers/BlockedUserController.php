<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Chat;
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
            $this->blockedUsers->listForUser($request->user(), $perPage)
        );
    }

    public function store(BlockUserRequest $request)
    {
        $data = $request->validated();

        $this->blockedUsers->block(
            $request->user(),
            Chat::resolveChatable($data['chatable_type'], $data['chatable_id']),
        );

        return response()->noContent();
    }

    public function destroy(Request $request, string $chatableType, int $chatableId)
    {
        $this->blockedUsers->unblock(
            $request->user(),
            Chat::resolveChatable($chatableType, $chatableId),
        );

        return response()->noContent();
    }
}
