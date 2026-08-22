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

        // Only successful fetches get cached — a transient timeout or dead site shouldn't be
        // remembered as "no preview" for the full TTL; retrying costs one extra request, which
        // is an acceptable tradeoff since failures are rare.
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
