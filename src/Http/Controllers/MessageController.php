<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Riwaaq\Chat\Contracts\MessageServiceInterface;
use Riwaaq\Chat\Http\Requests\ForwardMessageRequest;
use Riwaaq\Chat\Http\Requests\StoreMessageRequest;
use Riwaaq\Chat\Http\Requests\UpdateMessageRequest;
use Riwaaq\Chat\Http\Resources\MessageEditResource;
use Riwaaq\Chat\Http\Resources\MessageResource;
use Riwaaq\Chat\Models\Conversation;
use Riwaaq\Chat\Models\Message;

class MessageController extends Controller
{
    public const EAGER = ['chatable', 'attachments', 'reactions', 'replyTo.attachments', 'receipts.chatable', 'starredBy', 'pinnedIn', 'pollVotes', 'eventRsvps'];

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

    public function edits(Message $message)
    {
        Gate::authorize('view', $message->conversation);

        return MessageEditResource::collection(
            $message->edits()->orderByDesc('edited_at')->get()
        );
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

        // newCollection() (not the plain collect() helper, which never returns an Eloquent
        // collection) so a single load() batches all EAGER relations across every forwarded
        // message in one query per relation, instead of firing them per message.
        $forwarded = (new Message)->newCollection($forwarded)->load(self::EAGER);

        return MessageResource::collection($forwarded);
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
