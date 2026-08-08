<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\ParticipantRepositoryInterface;
use Converse\Chat\Contracts\ParticipantServiceInterface;
use Converse\Chat\Http\Requests\AddParticipantsRequest;
use Converse\Chat\Http\Requests\ChangeParticipantRoleRequest;
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

        $this->participantService->addParticipants(
            $conversation,
            array_map('intval', $request->validated()['user_ids']),
            $request->user()->getAuthIdentifier(),
        );

        return ParticipantResource::collection($this->participants->activeForConversation($conversation->id));
    }

    public function destroy(Conversation $conversation, int $userId, Request $request)
    {
        Gate::authorize('manageParticipants', $conversation);

        $this->participantService->removeParticipant($conversation, $userId, $request->user()->getAuthIdentifier());

        return response()->noContent();
    }

    public function updateRole(ChangeParticipantRoleRequest $request, Conversation $conversation, int $userId)
    {
        Gate::authorize('manageParticipants', $conversation);

        $this->participantService->changeRole($conversation, $userId, $request->validated()['role']);

        return response()->noContent();
    }

    public function leave(Request $request, Conversation $conversation)
    {
        Gate::authorize('view', $conversation);

        $this->participantService->leaveGroup($conversation, $request->user()->getAuthIdentifier());

        return response()->noContent();
    }
}
