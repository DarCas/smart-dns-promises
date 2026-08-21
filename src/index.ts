/*
 * Dario Casertano <dario@casertano.name>
 * Copyright (c) 2026 Casertano Dario – All rights reserved.
 * MIT
 */

import { Resolver, setDefaultResultOrder, setServers } from 'node:dns/promises'

/**
 * Represents a hostname of a server.
 */
type Hostname = string

/**
 * Represents an IP address.
 */
type IPAddress = string

/**
 * Specifies the order of DNS resolution results.
 */
type ResultOrder = 'ipv4first' | 'ipv6first' | 'verbatim'

/**
 * Specifies which IP address family to resolve.
 */
type AddressFamily = 'ipv4' | 'ipv6'

/**
 * A cached resolved address with its expiry timestamp.
 */
interface CacheEntry {
    address: IPAddress
    expiresAt: number
}

/**
 * Advanced options for cache and resolver behaviour.
 */
export interface SmartDnsOptions {
    /**
     * Which IP address family to resolve.
     * @default 'ipv4'
     */
    family?: AddressFamily

    /**
     * Upper bound for record TTLs coming from the DNS server, in milliseconds.
     * @default 3600000
     */
    maxTtl?: number

    /**
     * Lower bound for record TTLs coming from the DNS server, in milliseconds.
     * @default 1000
     */
    minTtl?: number

    /**
     * How long failed lookups are negatively cached, in milliseconds.
     * @default 30000
     */
    negativeTtl?: number

    /**
     * Called with updated statistics after every lookup.
     */
    onStats?: (stats: SmartDnsStats) => void

    /**
     * Serve expired entries immediately and refresh them in the background.
     * @default false
     */
    swr?: boolean
}

/**
 * Lookup statistics for the current instance.
 */
export interface SmartDnsStats {
    /** Average wall time of actual DNS queries, in milliseconds. */
    avgResolveMs: number
    /** Failed lookups (including those served from the negative cache). */
    errors: number
    /** Lookups served from cache. */
    hits: number
    /** Lookups that required an actual DNS query. */
    misses: number
    /** Background refreshes triggered by stale-while-revalidate. */
    revalidations: number
}

interface StatsCounters {
    errors: number
    hits: number
    misses: number
    resolutions: number
    revalidations: number
    totalResolveMs: number
}

/**
 * Enum for built-in DNS providers.
 * @readonly
 * @enum {number}
 */
export enum DnsProvider {
    CloudFlare,
    Google,
    OpenDNS,
}

/**
 * Error class for DNS provider-related errors.
 * @extends {Error}
 */
export class SmartDnsProviderError extends Error {
}

/**
 * Error class for DNS resolution-related errors.
 * @extends {Error}
 */
export class SmartDnsResolverError extends Error {
}

/**
 * Minimal zero-dependency LRU cache with expiry support.
 */
class LruCache {
    private readonly entries = new Map<Hostname, CacheEntry>()

    constructor(private readonly maxEntries: number) {
    }

    get(hostname: Hostname): CacheEntry | undefined {
        const entry = this.entries.get(hostname)

        if (!entry) {
            return undefined
        }

        this.entries.delete(hostname)
        this.entries.set(hostname, entry)

        return entry
    }

    set(hostname: Hostname, entry: CacheEntry): void {
        this.entries.delete(hostname)
        this.entries.set(hostname, entry)

        if (this.entries.size > this.maxEntries) {
            const oldest = this.entries.keys().next().value

            if (oldest !== undefined) {
                this.entries.delete(oldest)
            }
        }
    }
}

let SmartDnsInstance: SmartDns

/**
 * SmartDns class for managing DNS resolution with caching and configurable DNS providers.
 *
 * Configuration is applied to Node's process-global DNS system (`node:dns`):
 * `setProvider` and `setServers` replace the resolver servers for the whole
 * process, and `resultOrder` calls `dns.setDefaultResultOrder`. Every HTTP
 * client in the application is affected by (and benefits from) this setup.
 * Instantiate and configure SmartDns as early as possible in the application
 * lifecycle, ideally once.
 */
export class SmartDns {
    /**
     * Cache for hostname-IP mappings.
     */
    protected readonly cache: LruCache

    private readonly inflight = new Map<Hostname, Promise<IPAddress>>()

    private readonly negative = new Map<Hostname, number>()

    private readonly swr: boolean

    private readonly negativeTtl: number

    private readonly minTtl: number

    private readonly maxTtl: number

    private readonly family: AddressFamily

    private readonly onStats?: (stats: SmartDnsStats) => void

    private readonly counters: StatsCounters = {
        errors: 0,
        hits: 0,
        misses: 0,
        resolutions: 0,
        revalidations: 0,
        totalResolveMs: 0,
    }

    /**
     * Creates an instance of SmartDns.
     * @param [dnsProvider] Optional DNS provider to use.
     * @param [resultOrder='ipv4first'] Order of DNS resolution results.
     * @param [ttl=3600000] Fallback time-to-live for cached entries in milliseconds.
     * @param [options] Advanced cache and resolver options.
     */
    protected constructor(
        dnsProvider?: DnsProvider,
        resultOrder: ResultOrder = 'ipv4first',
        private readonly ttl = 3_600_000,
        options: SmartDnsOptions = {},
    ) {
        this.swr = options.swr ?? false
        this.negativeTtl = options.negativeTtl ?? 30_000
        this.minTtl = Math.max(options.minTtl ?? 1_000, 1)
        this.maxTtl = Math.max(options.maxTtl ?? 3_600_000, this.minTtl)
        this.family = options.family ?? 'ipv4'
        this.onStats = options.onStats
        this.cache = new LruCache(100)

        if (dnsProvider) {
            this.setProvider(dnsProvider)
        }

        setDefaultResultOrder(resultOrder)
    }

    /**
     * Creates or retrieves a singleton instance of SmartDns.
     *
     * As in v1, configuration passed after the first call is ignored because the
     * singleton has already been created.
     *
     * @param [dnsProvider] Optional DNS provider to use.
     * @param [resultOrder] Order of DNS resolution results.
     * @param [ttl] Fallback time-to-live for cached entries in milliseconds.
     * @param [options] Advanced cache and resolver options.
     * @returns The singleton SmartDns instance.
     */
    static factory(
        dnsProvider?: DnsProvider,
        resultOrder?: ResultOrder,
        ttl?: number,
        options?: SmartDnsOptions,
    ): SmartDns {
        if (!SmartDnsInstance) {
            SmartDnsInstance = new SmartDns(dnsProvider, resultOrder, ttl, options)
        }

        return SmartDnsInstance
    }

    /**
     * Current lookup statistics for this instance.
     */
    get stats(): SmartDnsStats {
        return {
            avgResolveMs: this.counters.resolutions > 0
                ? this.counters.totalResolveMs / this.counters.resolutions
                : 0,
            errors: this.counters.errors,
            hits: this.counters.hits,
            misses: this.counters.misses,
            revalidations: this.counters.revalidations,
        }
    }

    /**
     * Sets the DNS servers by the provider.
     *
     * Note: this mutates the process-global DNS configuration via `node:dns`.
     * @param dnsProvider The DNS provider to use.
     * @throws {SmartDnsProviderError} If the DNS provider is unsupported.
     */
    setProvider(dnsProvider: DnsProvider): void {
        switch (dnsProvider) {
            case DnsProvider.CloudFlare:
                setServers([
                    '1.1.1.1',
                    '1.0.0.1',
                ])
                break

            case DnsProvider.Google:
                setServers([
                    '8.8.8.8',
                    '8.8.4.4',
                ])
                break

            case DnsProvider.OpenDNS:
                setServers([
                    '208.67.222.222',
                    '208.67.220.220',
                ])
                break

            default:
                throw new SmartDnsProviderError(`Unsupported DNS provider: ${dnsProvider}. You can use the "setServers" method to manually set the DNS server IP addresses.`)
        }
    }

    /**
     * Resolves a URL and retrieves its IP address, hostname, and updated URL.
     * @async
     * @param url The URL to resolve (must start with http/https).
     * @returns An object containing the resolved IP address, hostname, and the URL with the hostname replaced by the IP address.
     * @throws {SmartDnsResolverError} If the URL is invalid or the lookup was recently failing.
     * @throws {Error} If the resolution fails.
     */
    async resolver(url: string): Promise<{
        address: IPAddress
        hostname: Hostname
        urlReplaced: string
    }> {
        if (!/^https?:\/\//.test(url)) {
            throw new SmartDnsResolverError(`The URL must start with http/https.`)
        }

        let parsedUrl: URL

        try {
            parsedUrl = new URL(url)
        } catch {
            throw new SmartDnsResolverError(`The URL "${url}" is not a valid URL.`)
        }

        const hostname = parsedUrl.hostname
        const address = await this.resolveAddress(hostname)

        return {
            address,
            hostname,
            urlReplaced: url.replace(hostname, address),
        }
    }

    /**
     * Manually sets DNS servers.
     *
     * Note: this mutates the process-global DNS configuration via `node:dns`.
     * @param servers Array of DNS server IP addresses.
     */
    setServers(servers: IPAddress[]): void {
        setServers(servers)
    }

    private async resolveAddress(hostname: Hostname): Promise<IPAddress> {
        const now = Date.now()
        const entry = this.cache.get(hostname)

        if (entry && entry.expiresAt > now) {
            this.counters.hits++
            this.emit()

            return entry.address
        }

        if (entry && this.swr) {
            this.counters.hits++
            this.counters.revalidations++
            this.revalidate(hostname)
            this.emit()

            return entry.address
        }

        const negativeUntil = this.negative.get(hostname)

        if (negativeUntil !== undefined && negativeUntil > now) {
            this.counters.errors++
            this.emit()
            throw new SmartDnsResolverError(`A recent lookup for "${hostname}" failed; retrying is rate limited by the negative cache.`)
        }

        this.counters.misses++

        return this.fetchAddress(hostname).finally(() => {
            this.emit()
        })
    }

    private fetchAddress(hostname: Hostname): Promise<IPAddress> {
        let pending = this.inflight.get(hostname)

        if (!pending) {
            pending = this.doResolve(hostname)
            this.inflight.set(hostname, pending)
            pending.then(
                () => undefined,
                () => undefined,
            ).finally(() => {
                this.inflight.delete(hostname)
            })
        }

        return pending
    }

    private revalidate(hostname: Hostname): void {
        void this.fetchAddress(hostname)
    }

    private async doResolve(hostname: Hostname): Promise<IPAddress> {
        const startedAt = Date.now()

        try {
            const resolver = new Resolver()
            const records = this.family === 'ipv6'
                ? await resolver.resolve6(hostname, { ttl: true })
                : await resolver.resolve4(hostname, { ttl: true })

            const [record] = records

            if (!record) {
                throw new Error(`No ${this.family} records found for "${hostname}".`)
            }

            const rawTtl = record.ttl > 0 ? record.ttl * 1000 : this.ttl
            const recordTtl = Math.min(Math.max(rawTtl, this.minTtl), this.maxTtl)

            this.cache.set(hostname, {
                address: record.address,
                expiresAt: Date.now() + recordTtl,
            })
            this.negative.delete(hostname)

            return record.address
        } catch (e) {
            this.counters.errors++
            this.negative.set(hostname, Date.now() + this.negativeTtl)
            throw e
        } finally {
            this.counters.resolutions++
            this.counters.totalResolveMs += Date.now() - startedAt
        }
    }

    private emit(): void {
        this.onStats?.(this.stats)
    }
}
