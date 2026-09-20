import { useState } from 'react';
import { Background } from './components/Background';
import { Footer } from './components/Footer';
import { Nav } from './components/Nav';
import { Behavior } from './sections/Behavior';
import { Facts } from './sections/Facts';
import { FinalCTA } from './sections/FinalCTA';
import { Hero } from './sections/Hero';
import { HiddenCost } from './sections/HiddenCost';
import { Install } from './sections/Install';
import { Integrations } from './sections/Integrations';
import { Mechanism } from './sections/Mechanism';
import { ProcessWide } from './sections/ProcessWide';
import { Stats } from './sections/Stats';
import type { ProviderId } from './lib/providers';

export function App() {
	const [provider, setProvider] = useState<ProviderId>('cloudflare');

	return (
		<>
			<Background />
			<Nav />
			<main className="main">
				<Hero />
				<HiddenCost />
				<Mechanism />
				<Behavior provider={provider} onProviderChange={setProvider} />
				<Integrations provider={provider} />
				<ProcessWide />
				<Stats />
				<Install />
				<Facts />
				<FinalCTA />
			</main>
			<Footer />
		</>
	);
}