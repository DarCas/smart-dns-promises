export const PROVIDERS = [
	{ id: 'adguard', name: 'AdGuard', servers: '94.140.14.14 · 94.140.15.15' },
	{ id: 'cloudflare', name: 'Cloudflare', servers: '1.1.1.1 · 1.0.0.1' },
	{ id: 'comodo', name: 'Comodo', servers: '8.26.56.26 · 8.20.247.20' },
	{ id: 'dnswatch', name: 'DNS.WATCH', servers: '84.200.69.80 · 84.200.70.40' },
	{ id: 'google', name: 'Google', servers: '8.8.8.8 · 8.8.4.4' },
	{ id: 'opendns', name: 'OpenDNS', servers: '208.67.222.222 · 208.67.220.220' },
	{ id: 'quad9', name: 'Quad9', servers: '9.9.9.9 · 149.112.112.112' },
	{ id: 'verisign', name: 'Verisign', servers: '64.6.64.6 · 64.6.65.6' },
	{ id: 'yandex', name: 'Yandex', servers: '77.88.8.8 · 77.88.8.1' }
] as const;

export type ProviderId = (typeof PROVIDERS)[number]['id'];

export function axiosSnippetId(provider: ProviderId): string {
	return `axios-${provider}`;
}

export function fetchSnippetId(provider: ProviderId): string {
	return `fetch-${provider}`;
}

/**
 * Picks `count` provider ids at random, always including `active`.
 * Pure helper used by the "Choose the resolver" visual so the radiogroup
 * stays small while the selection is never hidden.
 */
export function pickRandomProviders(active: ProviderId, count = 3): ProviderId[] {
	const ids = PROVIDERS.map((provider) => provider.id).filter((id) => id !== active);

	for (let i = ids.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[ids[i], ids[j]] = [ids[j], ids[i]];
	}

	return [active, ...ids.slice(0, Math.max(count - 1, 0))];
}
