<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\MessageServiceInterface;
use Converse\Chat\Http\Requests\ForwardMessageRequest;
use Converse\Chat\Http\Requests\StoreMessageRequest;
use Converse\Chat\Http\Requests\UpdateMessageRequest;
use Converse\Chat\Http\Resources\MessageResource;
use Converse\Chat\Models\Conversation;
use Converse\Chat\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class MessageController extends Controller
{
    protected const EAGER = ['chatable', 'attachments', 'reactions', 'replyTo.attachments', 'receipts.chatable', 'starredBy', 'pinnedIn', 'pollVotes', 'eventRsvps'];

    public function __construct(
        protected MessageServiceInterface $messages,
    ) {}

    public function index(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $perPage = (int) config('chat.pagination.messages_per_page', 50);
        $beforeId = $request->integer('before_id') ?: null;

        $messages = $this->messages->listForConversation(
            $conversation,
            $request->user(),
            $perPage,
            $beforeId,
        );

        return MessageResource::collection($messages);
    }

    public function store(StoreMessageRequest $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $message = $this->messages->send(
            $conversation,
            $request->user(),
            $request->validated(),
        );

        return (new MessageResource($message->load(self::EAGER)))
            ->response()
            ->setStatusCode(201);
    }

    public function update(UpdateMessageRequest $request, Message $message)
    {
        Gate::authorize('update', $message);

        $updated = $this->messages->update($message, $request->validated()['body']);

        return new MessageResource($updated->load(self::EAGER));
    }

    public function destroy(Message $message)
    {
        Gate::authorize('delete', $message);

        $this->messages->deleteForEveryone($message);

        return response()->noContent();
    }

    public function destroyForMe(Request $request, Message $message)
    {
        Gate::authorize('deleteForMe', $message);

        $this->messages->deleteForMe($message, $request->user());

        return response()->noContent();
    }

    public function forward(ForwardMessageRequest $request, Message $message)
    {
        Gate::authorize('forward', $message);

        $forwarded = $this->messages->forward(
            $message,
            array_map('intval', $request->validated()['conversation_ids']),
            $request->user(),
        );

        return MessageResource::collection(collect($forwarded)->map(fn (Message $m) => $m->load(self::EAGER)));
    }

    public function clear(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $this->messages->clearForChatable($conversation, $request->user());

        return response()->noContent();
    }

    public function search(Request $request)
    {
        $request->validate(['q' => ['required', 'string', 'min:1']]);

        $perPage = (int) config('chat.pagination.messages_per_page', 50);
        $conversationId = $request->integer('conversation_id') ?: null;

        $messages = $this->messages->search(
            $request->user(),
            $request->string('q')->toString(),
            $conversationId,
            $perPage,
        );

        return MessageResource::collection($messages);
    }

    public function media(Request $request)
    {
        $request->validate(['kind' => ['required', 'string', 'in:media,docs,links']]);

        $perPage = (int) config('chat.pagination.messages_per_page', 50);
        $conversationId = $request->integer('conversation_id') ?: null;

        $messages = $this->messages->media(
            $request->user(),
            $request->string('kind')->toString(),
            $conversationId,
            $perPage,
            $request->string('q')->toString() ?: null,
        );

        return MessageResource::collection($messages);
    }
}
