<?php

namespace Riwaaq\Chat\Http\Controllers;

class AssetController extends Controller
{
    public function js()
    {
        return $this->stream('app.js', 'application/javascript; charset=UTF-8');
    }

    public function css()
    {
        return $this->stream('app.css', 'text/css; charset=UTF-8');
    }

    protected function stream(string $file, string $contentType)
    {
        $path = __DIR__.'/../../../resources/dist/'.$file;

        abort_unless(is_file($path), 404);

        return response()->file($path, ['Content-Type' => $contentType])
            ->setCache(['public' => true, 'max_age' => 86400])
            ->setLastModified((new \DateTime)->setTimestamp(filemtime($path)))
            ->setEtag(md5_file($path));
    }
}
