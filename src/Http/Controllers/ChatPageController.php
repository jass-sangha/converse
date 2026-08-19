<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Http\Request;
use Riwaaq\Chat\Support\ChatConfig;

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
