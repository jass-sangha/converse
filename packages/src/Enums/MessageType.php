<?php

namespace Converse\Chat\Enums;

enum MessageType: string
{
    case Text = 'text';
    case Image = 'image';
    case Video = 'video';
    case Audio = 'audio';
    case Voice = 'voice';
    case Document = 'document';
    case Location = 'location';
    case Contact = 'contact';
    case Gif = 'gif';
    case Sticker = 'sticker';
    case System = 'system';
}
