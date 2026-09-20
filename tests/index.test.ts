import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { setServers } from 'node:dns/promises'
import { DnsProvider, SmartDns, SmartDnsProviderError, SmartDnsResolverError } from '../src/index.js'

const mocks = vi.hoisted(() => ({
    resolve4: vi.fn(),
    resolve6: vi.fn(),
    setServers: vi.fn(),
}))

vi.mock('node:dns/promises', () => {
    class MockResolver {
        resolve4 = mocks.resolve4
        resolve6 = mocks.resolve6
    }

    return {
        Resolver: MockResolver,
        setDefaultResultOrder: vi.fn(),
        setServers: mocks.setServers,
    }
})

class TestDns extends SmartDns {
}

const A_RECORDS = [{ address: '1.2.3.4', ttl: 60 }]
const A_RECORDS_NEW = [{ address: '5.6.7.8', ttl: 60 }]

describe('SmartDns', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        mocks.resolve4.mockReset()
        mocks.resolve4.mockResolvedValue(A_RECORDS)
        mocks.resolve6.mockReset()
        mocks.resolve6.mockResolvedValue(A_RECORDS)
        mocks.setServers.mockClear()
        vi.mocked(setServers).mockClear()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it('rejects URLs without http/https scheme', async () => {
        const dns = new TestDns()

        await expect(dns.resolver('ftp://example.com')).rejects.toThrow(SmartDnsResolverError)
        expect(mocks.resolve4).not.toHaveBeenCalled()
    })

    it('rejects malformed URLs with a SmartDnsResolverError', async () => {
        const dns = new TestDns()

        await expect(dns.resolver('http://')).rejects.toThrow(SmartDnsResolverError)
    })

    it('resolves a URL and replaces the hostname with the IP', async () => {
        const dns = new TestDns()
        const result = await dns.resolver('https://example.com/path')

        expect(result.address).toBe('1.2.3.4')
        expect(result.hostname).toBe('example.com')
        expect(result.urlReplaced).toBe('https://1.2.3.4/path')
        expect(mocks.resolve4).toHaveBeenCalledOnce()
    })

    it('serves repeated lookups from cache without hitting DNS again', async () => {
        const dns = new TestDns()

        await dns.resolver('https://example.com')
        await dns.resolver('https://example.com')

        expect(mocks.resolve4).toHaveBeenCalledOnce()
        expect(dns.stats.hits).toBe(1)
        expect(dns.stats.misses).toBe(1)
    })

    it('expires entries based on the real DNS record TTL', async () => {
        mocks.resolve4.mockResolvedValueOnce([{ address: '1.2.3.4', ttl: 1 }])
        const dns = new TestDns(undefined, undefined, undefined, { maxTtl: 3600000 })

        await dns.resolver('https://example.com')
        vi.advanceTimersByTime(2000)
        await dns.resolver('https://example.com')

        expect(mocks.resolve4).toHaveBeenCalledTimes(2)
    })

    it('clamps record TTL to the configured minimum', async () => {
        mocks.resolve4.mockResolvedValue([{ address: '1.2.3.4', ttl: 0 }])
        const dns = new TestDns(undefined, undefined, undefined, { minTtl: 5000 })

        await dns.resolver('https://example.com')
        vi.advanceTimersByTime(1000)
        await dns.resolver('https://example.com')

        expect(mocks.resolve4).toHaveBeenCalledOnce()
    })

    it('falls back to the constructor TTL when the record TTL is missing or zero', async () => {
        mocks.resolve4.mockResolvedValue([{ address: '1.2.3.4', ttl: 0 }])
        const dns = new TestDns(undefined, undefined, 3000)

        await dns.resolver('https://example.com')
        vi.advanceTimersByTime(2000)
        await dns.resolver('https://example.com')

        expect(mocks.resolve4).toHaveBeenCalledOnce()

        vi.advanceTimersByTime(2000)
        await dns.resolver('https://example.com')

        expect(mocks.resolve4).toHaveBeenCalledTimes(2)
    })

    it('deduplicates concurrent lookups into a single DNS query', async () => {
        let release!: (value: string) => void
        const gate = new Promise<string>((resolve) => {
            release = resolve
        })
        mocks.resolve4.mockReturnValue(gate.then((address) => [{ address, ttl: 60 }]))

        const dns = new TestDns()
        const firstPromise = dns.resolver('https://example.com')
        const secondPromise = dns.resolver('https://example.com')
        release('1.2.3.4')
        const [first, second] = await Promise.all([firstPromise, secondPromise])

        expect(first.address).toBe('1.2.3.4')
        expect(second.address).toBe('1.2.3.4')
        expect(mocks.resolve4).toHaveBeenCalledOnce()
        expect(dns.stats.misses).toBe(2)
    })

    it('negatively caches failed lookups for the configured time', async () => {
        mocks.resolve4.mockRejectedValue(new Error('ENOTFOUND'))
        const dns = new TestDns(undefined, undefined, undefined, { negativeTtl: 5000 })

        await expect(dns.resolver('https://example.com')).rejects.toThrow('ENOTFOUND')
        await expect(dns.resolver('https://example.com')).rejects.toThrow(SmartDnsResolverError)

        expect(mocks.resolve4).toHaveBeenCalledOnce()
        expect(dns.stats.errors).toBe(2)

        vi.advanceTimersByTime(6000)
        mocks.resolve4.mockResolvedValue(A_RECORDS)
        await expect(dns.resolver('https://example.com')).resolves.toBeDefined()
        expect(mocks.resolve4).toHaveBeenCalledTimes(2)
    })

    it('serves stale entries and revalidates in the background when swr is enabled', async () => {
        mocks.resolve4
            .mockResolvedValueOnce([{ address: '1.2.3.4', ttl: 1 }])
            .mockResolvedValueOnce(A_RECORDS_NEW)
        const dns = new TestDns(undefined, undefined, undefined, { swr: true })

        await dns.resolver('https://example.com')
        vi.advanceTimersByTime(2000)

        const stale = await dns.resolver('https://example.com')
        expect(stale.address).toBe('1.2.3.4')
        expect(dns.stats.revalidations).toBe(1)

        await vi.waitFor(() => expect(mocks.resolve4).toHaveBeenCalledTimes(2))
        const fresh = await dns.resolver('https://example.com')
        expect(fresh.address).toBe('5.6.7.8')
    })

    it('does not serve stale entries when swr is disabled', async () => {
        mocks.resolve4
            .mockResolvedValueOnce([{ address: '1.2.3.4', ttl: 1 }])
            .mockResolvedValueOnce(A_RECORDS_NEW)
        const dns = new TestDns()

        await dns.resolver('https://example.com')
        vi.advanceTimersByTime(2000)
        const result = await dns.resolver('https://example.com')

        expect(result.address).toBe('5.6.7.8')
        expect(dns.stats.revalidations).toBe(0)
    })

    it('resolves AAAA records when family is ipv6', async () => {
        mocks.resolve6.mockResolvedValue([{ address: '::1', ttl: 60 }])
        const dns = new TestDns(undefined, undefined, undefined, { family: 'ipv6' })
        const result = await dns.resolver('https://example.com')

        expect(result.address).toBe('::1')
        expect(mocks.resolve6).toHaveBeenCalledOnce()
        expect(mocks.resolve4).not.toHaveBeenCalled()
    })

    it('reports statistics including average resolve time', async () => {
        const seen: number[] = []
        const dns = new TestDns(undefined, undefined, undefined, {
            onStats: (stats) => seen.push(stats.avgResolveMs),
        })

        await dns.resolver('https://example.com')

        expect(seen.length).toBeGreaterThan(0)
        expect(typeof seen[seen.length - 1]).toBe('number')
    })

    it('throws SmartDnsProviderError for unsupported providers', () => {
        expect(() => new TestDns(99 as DnsProvider)).toThrow(SmartDnsProviderError)
    })

    it.each([
        [DnsProvider.AdGuard, ['94.140.14.14', '94.140.15.15']],
        [DnsProvider.CloudFlare, ['1.1.1.1', '1.0.0.1']],
        [DnsProvider.Comodo, ['8.26.56.26', '8.20.247.20']],
        [DnsProvider.DnsWatch, ['84.200.69.80', '84.200.70.40']],
        [DnsProvider.Google, ['8.8.8.8', '8.8.4.4']],
        [DnsProvider.OpenDNS, ['208.67.222.222', '208.67.220.220']],
        [DnsProvider.Quad9, ['9.9.9.9', '149.112.112.112']],
        [DnsProvider.Verisign, ['64.6.64.6', '64.6.65.6']],
        [DnsProvider.Yandex, ['77.88.8.8', '77.88.8.1']],
    ] as Array<[DnsProvider, string[]]>)('sets servers for provider %d', (provider, servers) => {
        const dns = new TestDns()

        dns.setProvider(provider)

        expect(vi.mocked(setServers)).toHaveBeenLastCalledWith(servers)
    })
})
