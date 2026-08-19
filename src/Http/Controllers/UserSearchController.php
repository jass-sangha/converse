<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\UserSearchServiceInterface;
use Riwaaq\Chat\Http\Resources\ChatUserResource;

class UserSearchController extends Controller
{
    public function __construct(
        protected UserSearchServiceInterface $users,
    ) {}

    public function index(Request $request)
    {
        $request->validate([
            'type' => ['sometimes', 'string', Rule::in(array_keys(Chat::chatableModels()))],
            'q' => ['sometimes', 'string', 'max:255'],
            'ids' => ['sometimes', 'array', 'max:200'],
            'ids.*' => ['integer'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:50'],
        ]);

        $type = $request->string('type')->toString() ?: $request->user()->getMorphClass();

        if ($request->filled('ids')) {
            $users = $this->users->findMany($type, array_map('intval', $request->array('ids')));

            return ChatUserResource::collection($users);
        }

        $perPage = (int) $request->integer('per_page', config('chat.pagination.users_per_page', 20));

        $users = $this->users->search(
            $request->user(),
            $type,
            $request->string('q')->toString() ?: null,
            $perPage,
        );

        return ChatUserResource::collection($users);
    }
}
