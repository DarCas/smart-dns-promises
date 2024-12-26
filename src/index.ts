// noinspection JSUnusedGlobalSymbols

/**
 * @author      Dario Casertano <dario@casertano.name>
 * @copyright   Copyright (c) 2024 Casertano Dario – All rights reserved.
 * @license     MIT
 */

import { LRUCache } from "lru-cache";
import { Resolver, setDefaultResultOrder, setServers } from 'node:dns/promises';

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

let SmartDnsInstance: SmartDns

/**
 * SmartDns class for managing DNS resolution with caching and configurable DNS providers.
 */
export class SmartDns {
    /**
     * Cache for hostname-IP mappings.
     */
    protected readonly cache: LRUCache<Hostname, IPAddress>

    /**
     * Creates an instance of SmartDns.
     * @param [dnsProvider] Optional DNS provider to use.
     * @param [resultOrder='ipv4first'] Order of DNS resolution results.
     * @param [ttl=3600000] Time-to-live for cached entries in milliseconds.
     */
    protected constructor(
        dnsProvider?: DnsProvider,
        resultOrder: ResultOrder = 'ipv4first',
        ttl = 3_600_000,
    ) {
        this.cache = new LRUCache<Hostname, IPAddress>({
            max: 100,
            ttl,
        })

        if (dnsProvider) {
            this.setProvider(dnsProvider)
        }

        setDefaultResultOrder(resultOrder)
    }

    /**
     * Creates or retrieves a singleton instance of SmartDns.
     * @param [dnsProvider] Optional DNS provider to use.
     * @param [resultOrder] Order of DNS resolution results.
     * @param [ttl] Time-to-live for cached entries in milliseconds.
     * @returns The singleton SmartDns instance.
     */
    static factory(dnsProvider?: DnsProvider, resultOrder?: ResultOrder, ttl?: number): SmartDns {
        if (!SmartDnsInstance) {
            SmartDnsInstance = new SmartDns(dnsProvider, resultOrder, ttl)
        }

        return SmartDnsInstance
    }

    /**
     * Sets the DNS servers by the provider.
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
     * @param url The URL to resolve.
     * @returns An object containing the resolved IP address, hostname, and the URL with the hostname replaced by the IP address.
     * @throws {SmartDnsResolverError} If the URL is invalid.
     * @throws {Error} If the resolution fails.
     */
    async resolver(url: string): Promise<{
        address: IPAddress
        hostname: Hostname
        urlReplaced: string
    } | undefined> {
        if (!/^https?:\/\//.test(url)) {
            throw new SmartDnsResolverError(`The URL must start with http/https.`)
        }

        try {
            const hostname = new URL(url).hostname

            if (!this.cache.has(hostname)) {
                const resolver = new Resolver()
                const [address] = await resolver.resolve4(hostname)
                this.cache.set(hostname, address)
            }

            if (this.cache.has(hostname)) {
                const address: IPAddress = this.cache.get(hostname)!

                return {
                    address,
                    hostname,
                    urlReplaced: url.replace(hostname, address),
                }
            }

            return undefined
        } catch (e) {
            throw e
        }
    }

    /**
     * Manually sets DNS servers.
     * @param servers Array of DNS server IP addresses.
     */
    setServers(servers: IPAddress[]): void {
        setServers(servers)
    }
}
