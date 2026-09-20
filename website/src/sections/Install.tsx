import { CodeBlock } from '../components/CodeBlock';
import { DOCS_URL, NPM_URL } from '../lib/links';

export function Install() {
	return (
		<section className="section" id="install">
			<div className="container">
				<div className="section-head">
					<p className="eyebrow">Installation</p>
					<h2 className="section-title">One package. No dependencies.</h2>
					<p className="section-lead">
						Add the resolver, point it at a provider and call it before the request. The
						first lookup is cached; the next ones never reach the resolver.
					</p>
				</div>

				<div className="install__grid">
					<div className="install__command">
						<CodeBlock id="install" caption="install" />
					</div>

					<div className="install__code">
						<CodeBlock id="quickstart" caption="quick start" />
						<div className="install__actions">
							<a className="btn btn--primary" href={DOCS_URL} target="_blank" rel="noreferrer noopener">
								Read the documentation <span className="btn__arrow">↗</span>
							</a>
							<a className="btn btn--quiet" href={NPM_URL} target="_blank" rel="noreferrer noopener">
								View on npm <span className="btn__arrow">↗</span>
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}