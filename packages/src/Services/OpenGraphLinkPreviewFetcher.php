<?php

namespace Converse\Chat\Services;

use Converse\Chat\Contracts\LinkPreviewFetcher;
use Illuminate\Support\Facades\Http;

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
            $response = Http::timeout(5)->get($url);
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
