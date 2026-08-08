<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\UserSearchServiceInterface;
use Converse\Chat\Http\Resources\ChatUserResource;
use Illuminate\Http\Request;

class UserSearchController extends Controller
{
    public function __construct(
        protected UserSearchServiceInterface $users,
    ) {}

    public function index(Request $request)
    {
        $request->validate([
            'q' => ['sometimes', 'string', 'max:255'],
            'ids' => ['sometimes', 'array', 'max:200'],
            'ids.*' => ['integer'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        if ($request->filled('ids')) {
            $users = $this->users->findMany(array_map('intval', $request->array('ids')));

            return ChatUserResource::collection($users);
        }

        $perPage = (int) $request->integer('per_page', config('chat.pagination.users_per_page', 20));

        $users = $this->users->search(
            $request->user()->getAuthIdentifier(),
            $request->string('q')->toString() ?: null,
            $perPage,
        );

        return ChatUserResource::collection($users);
    }
}
