# SmartDns

![NPM Last Update](https://img.shields.io/npm/last-update/%40darcas%2Fsmart-dns-promises)
![NPM Version](https://img.shields.io/npm/v/%40darcas%2Fsmart-dns-promises)
![NPM Downloads](https://img.shields.io/npm/dw/%40darcas%2Fsmart-dns-promises)
![NPM License](https://img.shields.io/npm/l/%40darcas%2Fsmart-dns-promises)

A simple and efficient DNS resolver with caching and configurable DNS providers for Node.js 20 and 22 or above.

The purpose of this library is to increase the speed and performance of DNS resolution in Node.js. In environments where requests are made using libraries like [fetch](https://github.com/node-fetch/node-fetch) or [axios](https://github.com/axios/axios), this can be very useful.

## Features

- DNS resolution with caching for faster lookups.
- Supports configurable DNS providers: CloudFlare, Google, and OpenDNS.
- Allows custom result order for DNS resolutions: IPv4 first, IPv6 first, or verbatim.
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
 
### Creating an instance

You can create or retrieve a singleton instance of the `SmartDns` class using the `factory` method. This method also allows you to configure the DNS provider, result order, and cache time-to-live (TTL).

```js
import { SmartDns } from '@darcas/smart-dns-promises'

// Create or get the singleton instance
const dns = SmartDns.factory();

// Optionally, configure DNS provider and result order
const dnsWithConfig = SmartDns.factory('Google', 'ipv4first', 600000);
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

## Contributing

If you'd like to contribute to the project, feel free to fork it and create a pull request. Please ensure that your changes are well-tested and properly documented.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Dario Casertano (DarCas)](https://github.com/DarCas).
