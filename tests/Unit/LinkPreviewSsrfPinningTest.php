<?php

use Riwaaq\Chat\Services\OpenGraphLinkPreviewFetcher;

/**
 * Exercises OpenGraphLinkPreviewFetcher::resolveHost() directly (via reflection) rather than
 * through fetch() + Http::fake() — the fake intercepts before Guzzle ever builds a curl
 * handle, so it can't observe whether a CURLOPT_RESOLVE pin was attached. Assertions here
 * confirm the pin is actually returned in the right shape instead of just trusting the
 * validation logic that produces it.
 */
function resolveHost(string $url): string|false|null
{
    $fetcher = new OpenGraphLinkPreviewFetcher;
    $method = new ReflectionMethod($fetcher, 'resolveHost');

    return $method->invoke($fetcher, $url);
}

it('rejects a private/loopback host outright, with nothing to pin', function () {
    expect(resolveHost('http://127.0.0.1/admin'))->toBeFalse();
});

it('rejects the cloud metadata host outright, with nothing to pin', function () {
    expect(resolveHost('http://169.254.169.254/latest/meta-data/'))->toBeFalse();
});

it('returns false for a non-http(s) scheme', function () {
    expect(resolveHost('file:///etc/passwd'))->toBeFalse();
});

it('allows a literal public IP with nothing to pin, since no DNS lookup was involved', function () {
    expect(resolveHost('http://1.1.1.1/page'))->toBeNull();
});

it('pins a resolved hostname to the exact IP it validated, keyed by host and port', function () {
    // example.com is used elsewhere in this suite's link-preview tests and is stable/always
    // resolves — real DNS lookup, same trade-off resolveIps() already makes.
    $pin = resolveHost('https://example.com/page');

    expect($pin)->toBeString()
        ->and($pin)->toStartWith('example.com:443:')
        ->and(explode(':', $pin, 3)[2])->not->toBeEmpty();
});
