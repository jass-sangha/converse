<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Support\Facades\Http;
use Riwaaq\Chat\Contracts\LinkPreviewFetcher;

/**
 * Default OG-tag scraper. Consuming apps can bind their own LinkPreviewFetcher
 * (e.g. backed by a dedicated unfurling service) without any package change.
 */
class OpenGraphLinkPreviewFetcher implements LinkPreviewFetcher
{
    public function fetch(string $url): array
    {
        $preview = [
            'url' => $url,
            'title' => null,
            'description' => null,
            'image' => null,
            'site_name' => null,
        ];

        try {
            // A short timeout here sounds safe but isn't — DNS resolution + connection setup for
            // an arbitrary third-party URL can legitimately take several seconds, and a fetch
            // that dies before finishing silently produces a preview with every field null (the
            // card still renders — it's just blank). Generous, bounded timeouts beat a fast
            // failure that looks like a bug.
            $response = Http::connectTimeout(8)->timeout(12)->get($url);
        } catch (\Throwable) {
            return $preview;
        }

        if (! $response->successful()) {
            return $preview;
        }

        $html = $response->body();

        $preview['title'] = $this->meta($html, 'og:title') ?? $this->titleTag($html);
        $preview['description'] = $this->meta($html, 'og:description');
        $preview['image'] = $this->meta($html, 'og:image');
        $preview['site_name'] = $this->meta($html, 'og:site_name');

        return $preview;
    }

    protected function meta(string $html, string $property): ?string
    {
        if (preg_match('/<meta[^>]+property=["\']'.preg_quote($property, '/').'["\'][^>]+content=["\']([^"\']*)["\']/i', $html, $matches)) {
            return html_entity_decode($matches[1]);
        }

        if (preg_match('/<meta[^>]+content=["\']([^"\']*)["\'][^>]+property=["\']'.preg_quote($property, '/').'["\']/i', $html, $matches)) {
            return html_entity_decode($matches[1]);
        }

        return null;
    }

    protected function titleTag(string $html): ?string
    {
        if (preg_match('/<title[^>]*>(.*?)<\/title>/is', $html, $matches)) {
            return html_entity_decode(trim($matches[1]));
        }

        return null;
    }
}
