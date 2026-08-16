<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Chat;
use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Contracts\ParticipantServiceInterface;
use Converse\Chat\Http\Requests\AddParticipantsRequest;
use Converse\Chat\Http\Requests\ChangeParticipantRoleRequest;
use Converse\Chat\Http\Resources\MessageResource;
use Converse\Chat\Http\Resources\ParticipantResource;
use Converse\Chat\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ParticipantController extends Controller
{
    public function __construct(
        protected ParticipantServiceInterface $participantService,
        protected ParticipantRepositoryInterface $participants,
    ) {}

    public function index(Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        return ParticipantResource::collection($this->participants->activeForConversation($conversation->id));
    }

    public function store(AddParticipantsRequest $request, Conversation $conversation)
    {
        Gate::authorize('manageParticipants', $conversation);

        $message = $this->participantService->addParticipants(
            $conversation,
            Chat::resolveMany($request->validated()['participants']),
            $request->user(),
        );

        return ParticipantResource::collection($this->participants->activeForConversation($conversation->id))
            ->additional(['message' => new MessageResource($message->load(MessageController::EAGER))]);
    }

    public function destroy(Conversation $conversation, string $chatableType, int $chatableId, Request $request)
    {
        Gate::authorize('manageParticipants', $conversation);

        $target = Chat::resolveChatable($chatableType, $chatableId);

        $message = $this->participantService->removeParticipant($conversation, $target, $request->user());

        return response()->json(['message' => new MessageResource($message->load(MessageController::EAGER))]);
    }

    public function updateRole(ChangeParticipantRoleRequest $request, Conversation $conversation, string $chatableType, int $chatableId)
    {
        Gate::authorize('manageParticipants', $conversation);

        $target = Chat::resolveChatable($chatableType, $chatableId);

        $message = $this->participantService->changeRole($conversation, $target, $request->validated()['role']);

        return response()->json(['message' => new MessageResource($message->load(MessageController::EAGER))]);
    }

    public function leave(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $this->participantService->leaveGroup($conversation, $request->user());

        return response()->noContent();
    }
}
