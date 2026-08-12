<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\ConversationServiceInterface;
use Converse\Chat\Http\Requests\MuteConversationRequest;
use Converse\Chat\Http\Requests\StoreConversationRequest;
use Converse\Chat\Http\Requests\UpdateConversationRequest;
use Converse\Chat\Http\Resources\ConversationResource;
use Converse\Chat\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ConversationController extends Controller
{
    public function __construct(
        protected ConversationServiceInterface $conversations,
    ) {}

    public function index(Request $request)
    {
        // Archived conversations are hidden from the main list by default, mirroring
        // WhatsApp's behavior — pass ?archived=true to view the archived folder instead.
        $filters = ['archived' => $request->boolean('archived', false)];

        if ($request->boolean('pinned')) {
            $filters['pinned'] = true;
        }

        if ($request->filled('q')) {
            $filters['q'] = $request->string('q')->toString();
        }

        $conversations = $this->conversations->listForUser(
            $request->user(),
            $filters,
        );

        return ConversationResource::collection($conversations);
    }

    public function store(StoreConversationRequest $request)
    {
        Gate::authorize('create', Conversation::class);

        $actor = $request->user();
        $data = $request->validated();
        $participants = Chat::resolveMany($data['participants']);

        if ($data['type'] === 'private') {
            $other = $participants->first();

            $result = $this->conversations->findOrCreatePrivate($actor, $other);

            return (new ConversationResource($result['conversation']->load(['participants', 'lastMessage'])))
                ->response()
                ->setStatusCode($result['created'] ? 201 : 200);
        }

        $conversation = $this->conversations->createGroup(
            ['name' => $data['name'] ?? null, 'description' => $data['description'] ?? null],
            $participants,
            $actor,
        );

        return (new ConversationResource($conversation->load(['participants', 'lastMessage'])))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        return new ConversationResource($conversation->load(['participants', 'lastMessage']));
    }

    public function update(UpdateConversationRequest $request, Conversation $conversation)
    {
        Gate::authorize('update', $conversation);

        $updated = $this->conversations->update($conversation, $request->validated());

        return new ConversationResource($updated->load(['participants', 'lastMessage']));
    }

    public function updateAvatar(Request $request, Conversation $conversation)
    {
        Gate::authorize('updateAvatar', $conversation);

        $request->validate(['avatar' => ['required', 'image', 'max:5120']]);

        $updated = $this->conversations->updateAvatar($conversation, $request->file('avatar'));

        return new ConversationResource($updated->load(['participants', 'lastMessage']));
    }

    public function mute(MuteConversationRequest $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $this->conversations->mute(
            $conversation,
            $request->user(),
            $request->validated()['muted_until'] ?? null,
        );

        return new ConversationResource($conversation->fresh(['participants', 'lastMessage']));
    }

    public function archive(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $this->conversations->setArchived(
            $conversation,
            $request->user(),
            $request->boolean('archived', true),
        );

        return new ConversationResource($conversation->fresh(['participants', 'lastMessage']));
    }

    public function pin(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $this->conversations->setPinned(
            $conversation,
            $request->user(),
            $request->boolean('pinned', true),
        );

        return new ConversationResource($conversation->fresh(['participants', 'lastMessage']));
    }

    public function favourite(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $this->conversations->setFavourited(
            $conversation,
            $request->user(),
            $request->boolean('favourited', true),
        );

        return new ConversationResource($conversation->fresh(['participants', 'lastMessage']));
    }

    public function hide(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $this->conversations->setHidden(
            $conversation,
            $request->user(),
            $request->boolean('hidden', true),
        );

        return new ConversationResource($conversation->fresh(['participants', 'lastMessage']));
    }

    public function wallpaper(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $request->validate(['wallpaper' => ['nullable', 'string', 'max:32']]);

        $this->conversations->setWallpaper(
            $conversation,
            $request->user(),
            $request->input('wallpaper'),
        );

        return new ConversationResource($conversation->fresh(['participants', 'lastMessage']));
    }

    public function disappearing(Request $request, Conversation $conversation)
    {
        // Either participant may toggle disappearing messages in a private chat;
        // only a group admin may change it for the whole group.
        Gate::authorize($conversation->isGroup() ? 'update' : 'view', $conversation);

        $request->validate(['ttl_seconds' => ['nullable', 'integer', 'min:1']]);

        $updated = $this->conversations->setDisappearingTtl($conversation, $request->input('ttl_seconds'));

        return new ConversationResource($updated->load(['participants', 'lastMessage']));
    }
}
