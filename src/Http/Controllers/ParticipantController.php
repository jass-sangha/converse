<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Riwaaq\Chat\Chat;
use Riwaaq\Chat\Contracts\ParticipantRepositoryInterface;
use Riwaaq\Chat\Contracts\ParticipantServiceInterface;
use Riwaaq\Chat\Http\Requests\AddParticipantsRequest;
use Riwaaq\Chat\Http\Requests\ChangeParticipantRoleRequest;
use Riwaaq\Chat\Http\Resources\MessageResource;
use Riwaaq\Chat\Http\Resources\ParticipantResource;
use Riwaaq\Chat\Models\Conversation;

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
