<?php

namespace Riwaaq\Chat\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Applied only to the full-page chat route (riwaaq.chat.page) so it can be
 * deliberately embedded in an <iframe> — nothing else in the app sets a frame
 * policy today, so without this the route's embeddability is an accident of
 * absent headers rather than a guarantee.
 */
class SetFrameAncestors
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $policy = config('chat.frame_ancestors', "'self'");

        if (empty($policy)) {
            return $response;
        }

        $response->headers->set('Content-Security-Policy', "frame-ancestors {$policy}");

        // X-Frame-Options only understands a single origin (or DENY/SAMEORIGIN), so it's only
        // meaningful — and only added — for the single-origin 'self' case; a custom multi-origin
        // policy relies on the CSP header above, which every modern browser honors.
        if ($policy === "'self'") {
            $response->headers->set('X-Frame-Options', 'SAMEORIGIN');
        }

        return $response;
    }
}
