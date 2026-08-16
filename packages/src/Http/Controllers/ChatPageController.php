<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Support\ChatConfig;
use Illuminate\Http\Request;

class ChatPageController extends Controller
{
    public function show(Request $request)
    {
        return view('chat::chat', [
            'chatConfig' => ChatConfig::build($request->user(), embed: false),
            'themeOverrideVersion' => ChatConfig::themeOverrideVersion(),
        ]);
    }
}
