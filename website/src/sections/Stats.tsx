import { CodeBlock } from '../components/CodeBlock';

const HITS = 16987;
const MISSES = 1205;
const ERRORS = 211;
const REVALIDATIONS = 184;
const AVG_MS = 8.4;

const TOTAL = HITS + MISSES + ERRORS;
const hitPct = (HITS / TOTAL) * 100;
const missPct = (MISSES / TOTAL) * 100;
const errPct = (ERRORS / TOTAL) * 100;

function fmt(value: number): string {
	return value.toLocaleString('en-US');
}

const METRICS = [
	{ key: 'CACHE HITS', value: fmt(HITS), tone: 'ok' },
	{ key: 'MISSES', value: fmt(MISSES), tone: 'plain' },
	{ key: 'ERRORS', value: fmt(ERRORS), tone: 'bad' },
	{ key: 'REVALIDATIONS', value: fmt(REVALIDATIONS), tone: 'warn' },
	{ key: 'AVG RESOLVE', value: `${AVG_MS.toFixed(1)} ms`, tone: 'plain' }
] as const;

export function Stats() {
	return (
		<section className="section" id="stats">
			<div className="container">
				<div className="section-head">
					<p className="eyebrow">Statistics</p>
					<h2 className="section-title">What it did, in numbers.</h2>
					<p className="section-lead">
						The resolver keeps a running account of hits, misses, errors, revalidations and
						average resolve time, exposed through a single readable property.
					</p>
				</div>

				<div className="stats__grid">
					<div className="stats__board">
						<div className="stats__bar" aria-hidden="true">
							<span className="stats__seg stats__seg--hits" style={{ width: `${hitPct}%` }} />
							<span className="stats__seg stats__seg--miss" style={{ width: `${missPct}%` }} />
							<span className="stats__seg stats__seg--err" style={{ width: `${errPct}%` }} />
						</div>

						<div className="stats__metrics">
							{METRICS.map((metric) => (
								<div key={metric.key} className="stats__metric">
									<span className="stats__key mono">{metric.key}</span>
									<span className={`stats__value mono stats__value--${metric.tone}`}>
										{metric.value}
									</span>
								</div>
							))}
						</div>

						<div className="stats__foot">
							<span className="stats__demo mono">DEMO VALUES</span>
							<span className="stats__foot-note">
								Illustrative readout of <code className="mono">dns.stats</code>. The library
								records real numbers at runtime — no benchmarks are claimed here.
							</span>
						</div>
					</div>

					<div className="stats__code">
						<CodeBlock id="stats" caption="dns.stats" />
					</div>
				</div>
			</div>
		</section>
	);
}