/*
 * Dario Casertano <dario@casertano.name>
 * Copyright (c) 2026 Casertano Dario – All rights reserved.
 * MIT
 */

const axiosSnippet = (provider) => ({
	lang: 'typescript',
	code: `import axios from 'axios'
import { SmartDns, DnsProvider } from '@darcas/smart-dns-promises'

const dns = SmartDns.factory(DnsProvider.${provider})

axios.interceptors.request.use(async (config) => {
    const { hostname, urlReplaced } = await dns.resolver(config.url!)

    config.headers.Host = hostname
    config.url = urlReplaced
    return config
})`
})

const fetchSnippet = (provider) => ({
	lang: 'typescript',
	code: `import { SmartDns, DnsProvider } from '@darcas/smart-dns-promises'

const dns = SmartDns.factory(DnsProvider.${provider})

const { hostname, urlReplaced } = await dns.resolver('http://service.internal/health')

// Request goes to the resolved IP; the Host header keeps the origin name.
const response = await fetch(urlReplaced, {
    headers: { Host: hostname }
})`
})

export const snippets = {
    'axios-adguard': axiosSnippet('AdGuard'),
    'axios-cloudflare': axiosSnippet('CloudFlare'),
    'axios-comodo': axiosSnippet('Comodo'),
    'axios-dnswatch': axiosSnippet('DnsWatch'),
    'axios-google': axiosSnippet('Google'),
    'axios-opendns': axiosSnippet('OpenDNS'),
    'axios-quad9': axiosSnippet('Quad9'),
    'axios-verisign': axiosSnippet('Verisign'),
    'axios-yandex': axiosSnippet('Yandex'),
    'custom-servers': {
        lang: 'typescript',
        code: `dns.setServers(['9.9.9.9', '149.112.112.112'])`
    },
    'errors': {
        lang: 'typescript',
        code: `import {
    SmartDns,
    SmartDnsProviderError,
    SmartDnsResolverError
} from '@darcas/smart-dns-promises'

try {
    await dns.resolver('not-a-url')
} catch (error) {
    if (error instanceof SmartDnsResolverError) {
        // invalid URL, or a negative-cached hostname
    }

    if (error instanceof SmartDnsProviderError) {
        // unknown DNS provider
    }
}`
    },
    'fetch-adguard': fetchSnippet('AdGuard'),
    'fetch-cloudflare': fetchSnippet('CloudFlare'),
    'fetch-comodo': fetchSnippet('Comodo'),
    'fetch-dnswatch': fetchSnippet('DnsWatch'),
    'fetch-google': fetchSnippet('Google'),
    'fetch-opendns': fetchSnippet('OpenDNS'),
    'fetch-quad9': fetchSnippet('Quad9'),
    'fetch-verisign': fetchSnippet('Verisign'),
    'fetch-yandex': fetchSnippet('Yandex'),
    'install': {
        lang: 'bash',
        code: `npm install @darcas/smart-dns-promises`
    },
    'options': {
        lang: 'typescript',
        code: `const dns = SmartDns.factory(DnsProvider.CloudFlare, 'ipv4first', 3_600_000, {
    family: 'ipv4',
    minTtl: 1_000,
    maxTtl: 3_600_000,
    negativeTtl: 30_000,
    swr: true,
    onStats: (stats) => console.log(stats)
})`
    },
    'providers': {
        lang: 'typescript',
        code: `import { SmartDns, DnsProvider } from '@darcas/smart-dns-promises'

const dns = SmartDns.factory()

dns.setProvider(DnsProvider.AdGuard)   // 94.140.14.14, 94.140.15.15
dns.setProvider(DnsProvider.CloudFlare) // 1.1.1.1, 1.0.0.1
dns.setProvider(DnsProvider.Comodo)     // 8.26.56.26, 8.20.247.20
dns.setProvider(DnsProvider.DnsWatch)   // 84.200.69.80, 84.200.70.40
dns.setProvider(DnsProvider.Google)     // 8.8.8.8, 8.8.4.4
dns.setProvider(DnsProvider.OpenDNS)    // 208.67.222.222, 208.67.220.220
dns.setProvider(DnsProvider.Quad9)      // 9.9.9.9, 149.112.112.112
dns.setProvider(DnsProvider.Verisign)   // 64.6.64.6, 64.6.65.6
dns.setProvider(DnsProvider.Yandex)     // 77.88.8.8, 77.88.8.1`
    },
    'quickstart': {
        lang: 'typescript',
        code: `import { SmartDns, DnsProvider } from '@darcas/smart-dns-promises'

const dns = SmartDns.factory(DnsProvider.CloudFlare)

const { address, hostname, urlReplaced } =
    await dns.resolver('https://www.google.com')

// address  → '142.250.72.14'
// hostname → 'www.google.com'
// urlReplaced → 'https://142.250.72.14/'`
    },
    'stats': {
        lang: 'typescript',
        code: `const {
    avgResolveMs,
    errors,
    hits,
    misses,
    revalidations,
} = dns.stats

console.log({
    hits,
    misses,
    errors,
    revalidations,
    avgResolveMs,
})`
    }
};
