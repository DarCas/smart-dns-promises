import { GITHUB_URL, NPM_URL } from '../lib/links';

export function Facts() {
	const items = [
		{ key: 'NODE', value: '20+', note: 'engines: 20 || >= 22' },
		{
			key: 'RUNTIME DEPENDENCIES',
			value: '0',
			note: 'nothing to audit'
		},
		{ key: 'LANGUAGE', value: 'TypeScript', note: 'strict, types included' },
		{ key: 'MODULES', value: 'ESM / CJS', note: 'both entry points' }
	];

	return (
		<section className="section" id="facts">
			<div className="container">
				<div className="section-head">
					<p className="eyebrow">Technical facts</p>
					<h2 className="section-title">Small surface, made to last.</h2>
					<p className="section-lead">
						The package exposes one factory, a small set of options and its own error
						classes. Everything else is the standard library.
					</p>
				</div>

				<div className="facts__grid">
					<dl className="facts">
						{items.map((item) => (
							<div key={item.key} className="facts__row">
								<dt className="facts__key mono">{item.key}</dt>
								<dd className="facts__val">
									<span className="facts__value mono">{item.value}</span>
									<span className="facts__note">{item.note}</span>
								</dd>
							</div>
						))}
					</dl>

					<aside className="facts__meta">
						<span className="facts__version mono">v{__SOFTWARE_VERSION__}</span>
						<ul className="facts__links">
							<li>
								<a href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
									Source on GitHub <span className="btn__arrow">↗</span>
								</a>
							</li>
							<li>
								<a href={NPM_URL} target="_blank" rel="noreferrer noopener">
									Package on npm <span className="btn__arrow">↗</span>
								</a>
							</li>
						</ul>
					</aside>
				</div>
			</div>
		</section>
	);
}