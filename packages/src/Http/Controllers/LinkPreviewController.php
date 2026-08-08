<?php

namespace Converse\Chat\Http\Controllers;

use Converse\Chat\Contracts\LinkPreviewFetcher;
use Converse\Chat\Http\Requests\LinkPreviewRequest;
use Illuminate\Support\Facades\Cache;

class LinkPreviewController extends Controller
{
    public function __construct(
        protected LinkPreviewFetcher $fetcher,
    ) {}

    public function store(LinkPreviewRequest $request)
    {
        abort_unless(config('chat.link_preview.enabled', true), 404);

        $url = $request->validated()['url'];
        $ttl = config('chat.link_preview.cache_ttl_minutes', 1440) * 60;

        $preview = Cache::remember(
            'chat:link-preview:'.md5($url),
            $ttl,
            fn () => $this->fetcher->fetch($url),
        );

        return response()->json(['data' => $preview]);
    }
}
