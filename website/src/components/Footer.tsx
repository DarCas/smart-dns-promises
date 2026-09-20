/*
 * Dario Casertano <dario@casertano.name>
 * Copyright (c) 2026 Casertano Dario – All rights reserved.
 * MIT
 */

import { BrandMark } from './BrandMark';
import { CoffeeButton } from './CoffeeButton';
import { AUTHOR_URL, GITHUB_URL, NPM_URL } from '../lib/links';

const START_YEAR = 2026;

function yearRange(): string {
	const current = new Date().getFullYear();
	return current > START_YEAR ? `${START_YEAR}–${current}` : `${START_YEAR}`;
}

export function Footer() {
	return (
		<footer className="footer">
			<div className="container">
				<div className="footer__inner">
					<div className="footer__brand">
						<BrandMark className="footer__mark" size={30} />
						<div>
							<div className="footer__wordmark">SmartDns</div>
							<div className="footer__tagline">DNS resolution, cached before the request.</div>
						</div>
					</div>

					<div className="footer__actions">
						<ul className="footer__nav">
							<li>
								<a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
									GitHub
								</a>
							</li>
							<li>
								<a href={NPM_URL} target="_blank" rel="noreferrer noopener">
									npm
								</a>
							</li>
						</ul>
						<CoffeeButton />
					</div>
				</div>

				<div className="footer__bottom">
					<span>
						© {yearRange()}{' '}
						<a href={AUTHOR_URL} target="_blank" rel="noreferrer noopener">
							Dario Casertano
						</a>
						. MIT License.
					</span>
					<span>Version {__SITE_VERSION__}</span>
				</div>
			</div>
		</footer>
	);
}
