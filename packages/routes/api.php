<?php

use Converse\Chat\Http\Controllers\AttachmentController;
use Converse\Chat\Http\Controllers\BlockedUserController;
use Converse\Chat\Http\Controllers\ChatListController;
use Converse\Chat\Http\Controllers\ConversationController;
use Converse\Chat\Http\Controllers\EventRsvpController;
use Converse\Chat\Http\Controllers\LinkPreviewController;
use Converse\Chat\Http\Controllers\MessageController;
use Converse\Chat\Http\Controllers\MessageReactionController;
use Converse\Chat\Http\Controllers\MessageReceiptController;
use Converse\Chat\Http\Controllers\NotificationController;
use Converse\Chat\Http\Controllers\ParticipantController;
use Converse\Chat\Http\Controllers\PinnedMessageController;
use Converse\Chat\Http\Controllers\PollVoteController;
use Converse\Chat\Http\Controllers\PresenceController;
use Converse\Chat\Http\Controllers\ProfileController;
use Converse\Chat\Http\Controllers\StarredMessageController;
use Converse\Chat\Http\Controllers\TypingController;
use Converse\Chat\Http\Controllers\UserSearchController;
use Illuminate\Support\Facades\Route;

Route::middleware(config('chat.middleware', ['api', 'auth:sanctum']))
    ->prefix(config('chat.route_prefix', 'api/chat'))
    ->group(function () {
        Route::get('conversations', [ConversationController::class, 'index']);
        Route::post('conversations', [ConversationController::class, 'store']);
        Route::get('conversations/{conversation}', [ConversationController::class, 'show']);
        Route::patch('conversations/{conversation}', [ConversationController::class, 'update']);
        Route::post('conversations/{conversation}/avatar', [ConversationController::class, 'updateAvatar']);
        Route::patch('conversations/{conversation}/mute', [ConversationController::class, 'mute']);
        Route::patch('conversations/{conversation}/archive', [ConversationController::class, 'archive']);
        Route::patch('conversations/{conversation}/pin', [ConversationController::class, 'pin']);
        Route::patch('conversations/{conversation}/hide', [ConversationController::class, 'hide']);
        Route::patch('conversations/{conversation}/wallpaper', [ConversationController::class, 'wallpaper']);

        Route::get('conversations/{conversation}/messages', [MessageController::class, 'index']);
        Route::post('conversations/{conversation}/messages', [MessageController::class, 'store']);
        Route::delete('conversations/{conversation}/messages', [MessageController::class, 'clear']);

        Route::patch('messages/{message}', [MessageController::class, 'update']);
        Route::delete('messages/{message}', [MessageController::class, 'destroy']);
        Route::delete('messages/{message}/me', [MessageController::class, 'destroyForMe']);
        Route::post('messages/{message}/forward', [MessageController::class, 'forward']);

        Route::post('messages/{message}/reactions', [MessageReactionController::class, 'store']);
        Route::delete('messages/{message}/reactions', [MessageReactionController::class, 'destroy']);

        Route::post('messages/{message}/poll/vote', [PollVoteController::class, 'store']);
        Route::post('messages/{message}/event/rsvp', [EventRsvpController::class, 'store']);

        Route::get('starred-messages', [StarredMessageController::class, 'index']);
        Route::post('messages/{message}/star', [StarredMessageController::class, 'store']);
        Route::delete('messages/{message}/star', [StarredMessageController::class, 'destroy']);

        Route::get('conversations/{conversation}/pinned-messages', [PinnedMessageController::class, 'index']);
        Route::post('messages/{message}/pin', [PinnedMessageController::class, 'store']);
        Route::delete('messages/{message}/pin', [PinnedMessageController::class, 'destroy']);

        Route::post('conversations/{conversation}/receipts/delivered', [MessageReceiptController::class, 'markDelivered']);
        Route::post('conversations/{conversation}/receipts/read', [MessageReceiptController::class, 'markRead']);

        Route::post('conversations/{conversation}/typing', [TypingController::class, 'update']);

        Route::patch('notifications/mute', [NotificationController::class, 'muteAll']);

        Route::post('presence/heartbeat', [PresenceController::class, 'heartbeat']);
        Route::get('users/{chatableType}/{chatableId}/presence', [PresenceController::class, 'show']);
        Route::get('users', [UserSearchController::class, 'index']);
        Route::post('profile/avatar', [ProfileController::class, 'updateAvatar']);
        Route::delete('profile/avatar', [ProfileController::class, 'destroyAvatar']);
        Route::get('profile/settings', [ProfileController::class, 'showSettings']);
        Route::patch('profile/settings', [ProfileController::class, 'updateSettings']);

        Route::get('conversations/{conversation}/participants', [ParticipantController::class, 'index']);
        Route::post('conversations/{conversation}/participants', [ParticipantController::class, 'store']);
        Route::delete('conversations/{conversation}/participants/{chatableType}/{chatableId}', [ParticipantController::class, 'destroy']);
        Route::patch('conversations/{conversation}/participants/{chatableType}/{chatableId}/role', [ParticipantController::class, 'updateRole']);
        Route::post('conversations/{conversation}/leave', [ParticipantController::class, 'leave']);

        Route::get('blocked-users', [BlockedUserController::class, 'index']);
        Route::post('blocked-users', [BlockedUserController::class, 'store']);
        Route::delete('blocked-users/{chatableType}/{chatableId}', [BlockedUserController::class, 'destroy']);

        Route::get('lists', [ChatListController::class, 'index']);
        Route::post('lists', [ChatListController::class, 'store']);
        Route::delete('lists/{list}', [ChatListController::class, 'destroy']);
        Route::post('lists/{list}/conversations', [ChatListController::class, 'addConversation']);
        Route::delete('lists/{list}/conversations/{conversationId}', [ChatListController::class, 'removeConversation']);

        Route::post('attachments', [AttachmentController::class, 'store']);

        Route::post('link-preview', [LinkPreviewController::class, 'store']);

        Route::get('messages/search', [MessageController::class, 'search']);
        Route::get('messages/media', [MessageController::class, 'media']);
        Route::patch('conversations/{conversation}/disappearing', [ConversationController::class, 'disappearing']);
        Route::post('broadcasting/auth', [\Illuminate\Broadcasting\BroadcastController::class, 'authenticate']);
    });
