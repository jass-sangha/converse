<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\ChatListServiceInterface;
use Converse\Chat\Http\Requests\StoreChatListRequest;
use Converse\Chat\Http\Resources\ChatListResource;
use Converse\Chat\Models\ChatList;
use Illuminate\Http\Request;

class ChatListController extends Controller
{
    public function __construct(
        protected ChatListServiceInterface $lists,
    ) {}

    public function index(Request $request)
    {
        return ChatListResource::collection($this->lists->listForUser($request->user()));
    }

    public function store(StoreChatListRequest $request)
    {
        $data = $request->validated();

        $list = $this->lists->create($request->user(), $data['name'], $data['conversation_ids'] ?? []);

        return (new ChatListResource($list->load('conversations')))
            ->response()
            ->setStatusCode(201);
    }

    public function destroy(Request $request, ChatList $list)
    {
        $this->lists->delete($list, $request->user());

        return response()->noContent();
    }

    public function addConversation(Request $request, ChatList $list)
    {
        $request->validate(['conversation_id' => ['required', 'integer']]);

        $this->lists->addConversation($list, $request->user(), $request->integer('conversation_id'));

        return response()->noContent();
    }

    public function removeConversation(Request $request, ChatList $list, int $conversationId)
    {
        $this->lists->removeConversation($list, $request->user(), $conversationId);

        return response()->noContent();
    }
}
