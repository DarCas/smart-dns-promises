# SmartDns

![NPM Last Update](https://img.shields.io/npm/last-update/%40darcas%2Fsmart-dns-promises?style=for-the-badge)
![NPM Version](https://img.shields.io/npm/v/%40darcas%2Fsmart-dns-promises?style=for-the-badge)
![NPM Downloads](https://img.shields.io/npm/dy/%40darcas%2Fsmart-dns-promises?style=for-the-badge)

![NPM License](https://img.shields.io/npm/l/%40darcas%2Fsmart-dns-promises?style=for-the-badge)

A simple and efficient DNS resolver with caching and configurable DNS providers for Node.js 20 and 22 or above.

The purpose of this library is to increase the speed and performance of DNS resolution in Node.js. In environments where requests are made using libraries like [fetch](https://github.com/node-fetch/node-fetch) or [axios](https://github.com/axios/axios), this can be very useful.

## Features

- DNS resolution with caching for faster lookups (zero runtime dependencies).
- Cache entries expire according to the **real DNS record TTL** (configurable min/max clamp).
- Negative caching of failed lookups to avoid hammering the resolver on down hosts.
- In-flight deduplication: concurrent lookups for the same hostname trigger a single DNS query.
- Optional stale-while-revalidate: expired entries are served immediately and refreshed in background.
- Lookup statistics: hits, misses, errors, revalidations and average resolve time.
- Supports configurable DNS providers: CloudFlare, Google, and OpenDNS.
- Allows custom result order for DNS resolutions: IPv4 first, IPv6 first, or verbatim, plus `ipv4`/`ipv6` family selection.
- Singleton pattern to ensure only one instance of the resolver is used.
- Manual configuration of DNS server addresses.

## Installation

To install the `SmartDns` in your project, run the following npm command:

```bash
npm install @darcas/smart-dns-promises
```

Or, if you're using yarn:

```bash
yarn add @darcas/smart-dns-promises
```

## Usage

> In environments such as APIs, it is recommended to call `factory` as early as possible in the application lifecycle to benefit from Node.js's DNS system configuration.
> See [Process-wide behaviour](#process-wide-behaviour) for details.
 
### Creating an instance

You can create or retrieve a singleton instance of the `SmartDns` class using the `factory` method. This method also allows you to configure the DNS provider, result order, and cache time-to-live (TTL).

```js
import { SmartDns } from '@darcas/smart-dns-promises'

// Create or get the singleton instance
const dns = SmartDns.factory();

// Optionally, configure DNS provider and result order
const dnsWithConfig = SmartDns.factory('Google', 'ipv4first', 600000);

// Advanced options (4th argument)
const dnsAdvanced = SmartDns.factory('CloudFlare', 'ipv4first', undefined, {
    swr: true,          // serve stale entries and refresh in background
    negativeTtl: 30000, // how long failed lookups are negatively cached (ms)
    minTtl: 1000,       // clamp for record TTLs coming from DNS (ms)
    maxTtl: 3600000,    // clamp for record TTLs coming from DNS (ms)
    family: 'ipv6',     // resolve AAAA records instead of A records
    onStats: (stats) => console.log(stats),
});
```

> Configuration passed to `factory` after the first call is ignored, because the singleton has already been created.

### Process-wide behaviour

`SmartDns` intentionally configures **Node's process-global DNS system** (`node:dns`):

- `setProvider()` and `setServers()` replace the resolver servers for the **whole process**, not just for this library.
- The `resultOrder` argument of `factory`/the constructor calls Node's `dns.setDefaultResultOrder()`, which is global too.

This is by design: every HTTP client in the application — axios, fetch, or any other dependency performing DNS lookups — benefits from (and is affected by) the configured provider. For this reason, call `factory()` as **early as possible** in the application lifecycle, ideally once, so your entire Node.js software runs with a consistent and fast DNS configuration.

If multiple configurations are applied, the last one wins for the whole process.

### Statistics

Every lookup updates the instance counters, available via the `stats` getter:

```js
const { hits, misses, errors, revalidations, avgResolveMs } = dns.stats
```
### Setting the DNS provider

You can set the DNS provider to CloudFlare, Google, or OpenDNS using the `setProvider` method.

```js
dns.setProvider('CloudFlare');
```

### Setting the result Order

The result order for DNS resolutions can be configured as follows:

- **`ipv4first`**: IPv4 addresses are preferred and returned before IPv6 addresses.
- **`ipv6first`**: IPv6 addresses are preferred and returned before IPv4 addresses.
- **`verbatim`**: The DNS resolution returns results in the exact order as returned by the DNS provider without preference for IPv4 or IPv6.

### Resolving URLs

Use the `resolver` method to resolve a URL and get its IP address, hostname, and updated URL with the hostname replaced by the IP address.

```js
const result = await dns.resolver('https://example.com');
console.log(result.address);  // Resolved IP address
console.log(result.hostname); // Original hostname
console.log(result.urlReplaced); // URL with IP address instead of hostname
```

### Manually setting DNS servers

You can manually set DNS server IP addresses using the `setServers` method.

```js
dns.setServers(['8.8.8.8', '8.8.4.4']);
```

## Error Handling

The library throws two types of errors:

1. **SmartDnsProviderError**: Thrown when an unsupported DNS provider is used.
2. **SmartDnsResolverError**: Thrown when there is an issue with resolving a URL (e.g., invalid URL format).

## Example with Axios

This example shows how to use the package along with Axios to automatically resolve the hostname in requests to the corresponding IP address and adjust the request headers.

```ts
import { DnsProvider, SmartDns } from '@darcas/smart-dns-promises'
import { default as _axios, InternalAxiosRequestConfig } from 'axios';

const axios = _axios.create()
const dns = SmartDns.factory(DnsProvider.OpenDNS)

axios.interceptors.request.use(async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
    const {
        address,
        hostname,
        urlReplaced,
    } = await dns.resolver(config.url)

    config.headers = {
        ...config.headers ?? {},
        Host: hostname,
    } 
    config.url = urlReplaced

    return config
})
```

## Example with fetch

The same idea with the global `fetch`: resolve once, request the IP directly and pass the original hostname in the `Host` header.

```ts
import { SmartDns } from '@darcas/smart-dns-promises'

const dns = SmartDns.factory()

async function smartFetch(url: string, init: RequestInit = {}): Promise<Response> {
    const { urlReplaced } = await dns.resolver(url)

    return fetch(urlReplaced, {
        ...init,
        headers: {
            ...init.headers,
            Host: new URL(url).hostname,
        },
    })
}
```

Two things to keep in mind:

1. Replacing the hostname with the IP address means the TLS handshake is performed against the IP: this works out of the box with plain HTTP endpoints or controlled environments, but on public HTTPS endpoints the certificate is issued to the hostname, so the request will fail certificate validation. For HTTPS use cases prefer the axios example above.
2. Thanks to the cache, subsequent requests to the same host skip the DNS lookup entirely.

## Contributing

If you'd like to contribute to the project, feel free to fork it and create a pull request. Please ensure that your changes are well-tested and properly documented.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Dario Casertano (DarCas)](https://github.com/DarCas).
