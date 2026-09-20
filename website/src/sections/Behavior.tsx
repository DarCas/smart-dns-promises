import { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import { PROVIDERS, pickRandomProviders } from '../lib/providers';
import type { ProviderId } from '../lib/providers';

function TtlVisual() {
	return (
		<div className="viz viz--ttl">
			<div className="ttl">
				<div className="ttl__rec">
					<span className="ttl__type mono">A</span>
					<span className="ttl__addr mono">142.250.72.14</span>
					<span className="ttl__ttl mono">TTL 300s</span>
				</div>
				<div className="ttl__bar" aria-hidden="true">
					<span className="ttl__fill" />
				</div>
				<div className="ttl__axis mono">
					<span>300</span>
					<span>240</span>
					<span>180</span>
					<span>120</span>
					<span>60</span>
					<span>0</span>
				</div>
			</div>
		</div>
	);
}

function DedupeVisual() {
	return (
		<div className="viz viz--dedupe">
			<svg
				viewBox="0 0 420 240"
				role="img"
				aria-label="Five concurrent requests for the same hostname converge into a single DNS query."
			>
				{[40, 80, 120, 160, 200].map((y, index) => (
					<line
						key={y}
						className="dedupe__wire"
						x1="58"
						y1={y}
						x2="196"
						y2="120"
						style={{ animationDelay: `${index * 0.18}s` }}
					/>
				))}

				{[40, 80, 120, 160, 200].map((y, index) => (
					<circle
						key={y}
						className="dedupe__req"
						cx="42"
						cy={y}
						r="5"
						style={{ animationDelay: `${index * 0.18}s` }}
					/>
				))}

				<path className="dedupe__merged" d="M196 120 H340" />
				<circle className="dedupe__pulse" r="5">
					<animateMotion dur="3.2s" repeatCount="indefinite" path="M196 120 H340" />
				</circle>

				<rect className="dedupe__resolver" x="340" y="96" width="64" height="48" rx="3" />
				<text className="dedupe__resolver-text" x="372" y="124" textAnchor="middle">
					DNS
				</text>
				<text className="dedupe__host" x="42" y="18">
					app.example.com ×5
				</text>
			</svg>
			<span className="viz__tag mono">5 requests · 1 query</span>
		</div>
	);
}

function SwrVisual() {
	return (
		<div className="viz viz--swr">
			<div className="swr">
				<span className="swr__chip swr__chip--expired mono">EXPIRED</span>
				<span className="swr__arrow" aria-hidden="true">→</span>
				<span className="swr__chip swr__chip--serve mono">SERVE STALE</span>
			</div>
			<div className="swr swr__background">
				<span className="swr__chip swr__chip--bg mono">REFRESH</span>
				<span className="swr__note mono">in the background, non-blocking</span>
			</div>
		</div>
	);
}

function NegativeVisual() {
	return (
		<div className="viz viz--negative">
			<div className="neg">
				<span className="neg__chip mono">NXDOMAIN / ERROR</span>
				<span className="neg__arrow" aria-hidden="true">→</span>
				<span className="neg__chip neg__chip--store mono">NEGATIVE CACHE</span>
				<span className="neg__arrow" aria-hidden="true">→</span>
				<span className="neg__chip neg__chip--resolver mono">RESOLVER</span>
			</div>
			<div className="neg__meter" aria-hidden="true">
				<span className="neg__meter-fill" />
			</div>
			<span className="viz__tag mono">repeated failures are answered locally</span>
		</div>
	);
}

interface ProviderVisualProps {
	provider: ProviderId;
	onChange: (provider: ProviderId) => void;
}

function ProviderVisual({ provider: active, onChange }: ProviderVisualProps) {
	const [visible, setVisible] = useState<ProviderId[]>(() => {
		const others = PROVIDERS.map((provider) => provider.id).filter((id) => id !== active);

		return [active, ...others.slice(0, 2)];
	});

	useEffect(() => {
		setVisible(pickRandomProviders(active));
	}, []);

	// PROVIDERS is alphabetical, so filtering preserves alphabetical order.
	const visibleProviders = PROVIDERS.filter((provider) => visible.includes(provider.id));
	const hiddenProviders = PROVIDERS.filter((provider) => !visible.includes(provider.id));

	return (
		<div className="viz viz--provider">
			<div className="prov" role="radiogroup" aria-label="DNS provider">
				{visibleProviders.map((provider) => {
					const selected = provider.id === active;
					return (
						<button
							key={provider.id}
							type="button"
							role="radio"
							aria-checked={selected}
							className={['prov__row', selected ? 'is-active' : ''].filter(Boolean).join(' ')}
							onClick={() => onChange(provider.id)}
						>
							<span className="prov__node" aria-hidden="true" />
							<span className="prov__name">{provider.name}</span>
							<span className="prov__servers mono">{provider.servers}</span>
						</button>
					);
				})}
			</div>
			<div className="prov__out">
				<span className="prov__out-line" aria-hidden="true" />
				<span className="prov__out-label mono">selected provider</span>
			</div>
			<p className="prov__note mono">
				3 of {PROVIDERS.length} providers shown — {hiddenProviders.length} more built in.
			</p>
			<p className="prov__all mono">
				Also built in: {hiddenProviders.map((provider) => provider.name).join(' · ')}
			</p>
		</div>
	);
}

interface Feature {
	index: string;
	title: string;
	body: string;
	visual: () => ReactElement;
}

function buildFeatures(
	provider: ProviderId,
	onProviderChange: (provider: ProviderId) => void
): Feature[] {
	return [
		{
			index: '01',
			title: 'Cache that respects DNS',
			body: 'Cache lifetime follows the record TTL, with configurable bounds. Answers do not outlive the authority that issued them.',
			visual: TtlVisual
		},
		{
			index: '02',
			title: 'One lookup. Many callers.',
			body: 'Concurrent lookups for the same hostname share one in-flight resolution. Five calls, one query.',
			visual: DedupeVisual
		},
		{
			index: '03',
			title: 'Stale, then refresh',
			body: 'Optionally serve stale entries immediately while refreshing them in the background, so the request never waits.',
			visual: SwrVisual
		},
		{
			index: '04',
			title: 'Failed lookups are remembered too',
			body: 'Errors are held in a short negative cache, avoiding repeated resolver pressure for hostnames that will not resolve.',
			visual: NegativeVisual
		},
		{
			index: '05',
			title: 'Choose the resolver',
			body: 'Switch between nine public providers — or hand it your own servers — without changing how the request is written.',
			visual: () => <ProviderVisual provider={provider} onChange={onProviderChange} />
		}
	];
}

interface BehaviorProps {
	provider: ProviderId;
	onProviderChange: (provider: ProviderId) => void;
}

export function Behavior({ provider, onProviderChange }: BehaviorProps) {
	const features = buildFeatures(provider, onProviderChange);

	return (
		<section className="section" id="behavior">
			<div className="container">
				<div className="section-head">
					<p className="eyebrow">Behavior</p>
					<h2 className="section-title">What the cache actually does.</h2>
					<p className="section-lead">
						Five behaviors, each one driven by the real record and the real request — not a
						settings panel.
					</p>
				</div>

				<div className="behavior">
					{features.map((feature, index) => {
						const Visual = feature.visual;
						return (
							<article
								key={feature.index}
								className={['behavior__row', index % 2 === 1 ? 'behavior__row--flip' : '']
									.filter(Boolean)
									.join(' ')}
							>
								<div className="behavior__text">
									<span className="behavior__index mono">{feature.index}</span>
									<h3 className="behavior__title">{feature.title}</h3>
									<p className="behavior__body">{feature.body}</p>
								</div>
								<div className="behavior__visual">
									<Visual />
								</div>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}