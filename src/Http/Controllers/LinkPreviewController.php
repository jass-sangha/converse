<?php

namespace Riwaaq\Chat\Http\Controllers;

use Illuminate\Support\Facades\Cache;
use Riwaaq\Chat\Contracts\LinkPreviewFetcher;
use Riwaaq\Chat\Http\Requests\LinkPreviewRequest;

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
        $key = 'chat:link-preview:'.md5($url);

        // Only successful fetches get cached — a transient timeout or a dead site shouldn't
        // get remembered as "no preview" for a full day; every empty-titled retry costs one
        // more real request instead, which is the right tradeoff for something this rare.
        $preview = Cache::get($key);

        if ($preview === null) {
            $preview = $this->fetcher->fetch($url);

            if (! empty($preview['title']) || ! empty($preview['image'])) {
                Cache::put($key, $preview, $ttl);
            }
        }

        return response()->json(['data' => $preview]);
    }
}
