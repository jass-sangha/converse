<?php

namespace Converse\Chat;

class Chat
{
    public static function userModel(): string
    {
        return config('chat.user_model');
    }

    public static function table(string $key): string
    {
        return config("chat.table_names.{$key}", "chat_{$key}");
    }
}
