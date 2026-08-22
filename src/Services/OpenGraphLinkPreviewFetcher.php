<?php

namespace Riwaaq\Chat\Services;

use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Http;
use Riwaaq\Chat\Contracts\LinkPreviewFetcher;

/**
 * Default OG-tag scraper. Consuming apps can bind their own LinkPreviewFetcher
 * (e.g. backed by a dedicated unfurling service) without any package change.
 */
class OpenGraphLinkPreviewFetcher implements LinkPreviewFetcher
{
    protected const ALLOWED_SCHEMES = ['http', 'https'];

    /**
     * CIDR ranges this fetcher must never be able to reach: RFC1918 private space, loopback,
     * link-local (this includes 169.254.169.254 — the AWS/GCP/Azure cloud metadata endpoint,
     * the single most common SSRF target), CGNAT, documentation/benchmarking ranges, multicast,
     * and the IPv6 equivalents (unique-local, link-local, IPv4-mapped, multicast). The URL is
     * attacker-controlled (anyone who can send a chat message), so without this an SSRF payload
     * can make this server issue requests to its own internal network on the attacker's behalf.
     */
    protected const BLOCKED_RANGES = [
        '0.0.0.0/8', '10.0.0.0/8', '100.64.0.0/10', '127.0.0.0/8', '169.254.0.0/16',
        '172.16.0.0/12', '192.0.0.0/24', '192.0.2.0/24', '192.168.0.0/16',
        '198.18.0.0/15', '198.51.100.0/24', '203.0.113.0/24', '224.0.0.0/4', '240.0.0.0/4',
        '255.255.255.255/32',
        '::1/128', '::/128', '::ffff:0:0/96', '64:ff9b::/96', '100::/64',
        '2001:db8::/32', 'fc00::/7', 'fe80::/10', 'ff00::/8',
    ];

    protected const MAX_BYTES = 1024 * 1024; // A <head> full of OG tags never needs more than this.

    protected const MAX_REDIRECTS = 3;

    public function fetch(string $url): array
    {
        $preview = [
            'url' => $url,
            'title' => null,
            'description' => null,
            'image' => null,
            'site_name' => null,
        ];

        $response = null;

        for ($hop = 0; $hop <= self::MAX_REDIRECTS; $hop++) {
            $resolution = $this->resolveHost($url);

            if ($resolution === false) {
                return $preview;
            }

            $options = [
                // Tighter than you'd expect for a "just fetch a URL" request because the target
                // is attacker-controlled: a slow/hanging server would otherwise tie up a worker
                // indefinitely, so some legitimately slow sites will now come back blank instead
                // of with a preview. `stream: true` + readBounded() below cap response size
                // without buffering an attacker's response fully into memory first.
                'allow_redirects' => false,
                'stream' => true,
            ];

            if ($resolution !== null) {
                // Pins curl's connection to the exact IP resolveHost() just validated, instead
                // of letting curl re-resolve the hostname itself at connect time. Without this,
                // a DNS-rebinding attacker returns a public IP for resolveHost()'s lookup and a
                // private/metadata IP a moment later for curl's own lookup — passing every check
                // above while still landing the request on the internal network.
                $options['curl'] = [CURLOPT_RESOLVE => [$resolution]];
            }

            try {
                $response = Http::connectTimeout(3)
                    ->timeout(5)
                    ->withOptions($options)
                    ->get($url);
            } catch (\Throwable) {
                return $preview;
            }

            if (! in_array($response->status(), [301, 302, 303, 307, 308], true)) {
                break;
            }

            // Guzzle's own allow_redirects is deliberately off: a URL that passes resolveHost()
            // can still 30x to an internal address, so every hop is re-validated by hand instead
            // of trusting the client to follow the chain unchecked.
            $location = $response->header('Location');

            if (! $location) {
                return $preview;
            }

            $url = $this->resolveRedirectUrl($url, $location);
        }

        if (! $response->successful()) {
            return $preview;
        }

        $html = $this->readBounded($response, self::MAX_BYTES);

        $preview['title'] = $this->meta($html, 'og:title') ?? $this->titleTag($html);
        $preview['description'] = $this->meta($html, 'og:description');
        $preview['image'] = $this->meta($html, 'og:image');
        $preview['site_name'] = $this->meta($html, 'og:site_name');

        return $preview;
    }

    /**
     * Validates the current hop's host and, when resolving it required a DNS lookup, returns
     * a CURLOPT_RESOLVE pin ("host:port:ip") for the exact IP that was just checked — see the
     * call site for why that pin matters.
     *
     * @return string|false|null false = reject this hop entirely; null = safe with nothing to
     *                           pin (host is already a literal IP, or didn't resolve at all —
     *                           left to fail naturally); string = the CURLOPT_RESOLVE pin.
     */
    protected function resolveHost(string $url): string|false|null
    {
        $parts = parse_url($url);
        $scheme = strtolower($parts['scheme'] ?? '');
        $host = $parts['host'] ?? null;

        if (! $host || ! in_array($scheme, self::ALLOWED_SCHEMES, true)) {
            return false;
        }

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return $this->isPubliclyRoutable($host) ? null : false;
        }

        $ips = $this->resolveIps($host);

        foreach ($ips as $ip) {
            if (! $this->isPubliclyRoutable($ip)) {
                return false;
            }
        }

        // An unresolvable host has nothing to validate — or pin — against; let the HTTP
        // client's own connection attempt fail naturally (already wrapped in try/catch above)
        // rather than block on an inconclusive lookup.
        if ($ips === []) {
            return null;
        }

        $port = $parts['port'] ?? ($scheme === 'https' ? 443 : 80);
        $ip = $ips[0];

        // curl's --resolve/CURLOPT_RESOLVE syntax brackets IPv6 literals in the address field,
        // same as a URL host would be.
        return $host.':'.$port.':'.(str_contains($ip, ':') ? "[{$ip}]" : $ip);
    }

    /**
     * @return list<string>
     */
    protected function resolveIps(string $host): array
    {
        if (filter_var($host, FILTER_VALIDATE_IP)) {
            return [$host];
        }

        $records = @dns_get_record($host, DNS_A + DNS_AAAA) ?: [];

        return array_values(array_unique(array_filter(
            array_map(fn (array $record) => $record['ip'] ?? $record['ipv6'] ?? null, $records)
        )));
    }

    protected function isPubliclyRoutable(string $ip): bool
    {
        foreach (self::BLOCKED_RANGES as $range) {
            if ($this->ipInRange($ip, $range)) {
                return false;
            }
        }

        return true;
    }

    protected function ipInRange(string $ip, string $cidr): bool
    {
        [$subnet, $bits] = explode('/', $cidr);

        $ipBin = @inet_pton($ip);
        $subnetBin = @inet_pton($subnet);

        if ($ipBin === false || $subnetBin === false || strlen($ipBin) !== strlen($subnetBin)) {
            return false;
        }

        $bits = (int) $bits;
        $fullBytes = intdiv($bits, 8);
        $remainderBits = $bits % 8;

        if ($fullBytes > 0 && substr($ipBin, 0, $fullBytes) !== substr($subnetBin, 0, $fullBytes)) {
            return false;
        }

        if ($remainderBits === 0) {
            return true;
        }

        $mask = (~(0xFF >> $remainderBits)) & 0xFF;

        return (ord($ipBin[$fullBytes]) & $mask) === (ord($subnetBin[$fullBytes]) & $mask);
    }

    protected function resolveRedirectUrl(string $base, string $location): string
    {
        if (parse_url($location, PHP_URL_SCHEME)) {
            return $location;
        }

        $baseParts = parse_url($base);
        $scheme = $baseParts['scheme'] ?? 'https';
        $host = $baseParts['host'] ?? '';
        $port = isset($baseParts['port']) ? ':'.$baseParts['port'] : '';

        return $scheme.'://'.$host.$port.'/'.ltrim($location, '/');
    }

    protected function readBounded(Response $response, int $maxBytes): string
    {
        $stream = $response->toPsrResponse()->getBody();
        $buffer = '';

        while (! $stream->eof() && strlen($buffer) < $maxBytes) {
            $chunk = $stream->read(min(8192, $maxBytes - strlen($buffer)));

            if ($chunk === '') {
                break;
            }

            $buffer .= $chunk;
        }

        return $buffer;
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
