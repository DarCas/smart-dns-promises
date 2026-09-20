/*
 * Dario Casertano <dario@casertano.name>
 * Copyright (c) 2026 Casertano Dario – All rights reserved.
 * MIT
 */

import { CopyButton } from '../components/CopyButton';
import { GITHUB_URL, NPM_URL } from '../lib/links';

export function FinalCTA() {
	return (
		<section className="section cta" id="start">
			<div className="container">
				<div className="cta__panel">
					<h2 className="cta__title">
						The network already knows where to go.
						<br />
						<span className="accent">Don't ask it twice.</span>
					</h2>
					<p className="cta__lead">
						Install the package, resolve with the cache in place, and keep repeated DNS
						lookups out of the critical path.
					</p>

					<div className="cta__command mono">
						<span className="cta__prompt" aria-hidden="true">$</span>
						npm install @darcas/smart-dns-promises
						<CopyButton code="npm install @darcas/smart-dns-promises" />
					</div>

					<div className="btn-row cta__actions">
						<a className="btn btn--primary" href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
							View on GitHub <span className="btn__arrow">↗</span>
						</a>
						<a className="btn" href={NPM_URL} target="_blank" rel="noreferrer noopener">
							View on npm <span className="btn__arrow">↗</span>
						</a>
					</div>
				</div>
			</div>
		</section>
	);
}
