<?php

namespace Converse\Chat\Contracts;

interface LinkPreviewFetcher
{
    /**
     * @return array{url: string, title: ?string, description: ?string, image: ?string, site_name: ?string}
     */
    public function fetch(string $url): array;
}
