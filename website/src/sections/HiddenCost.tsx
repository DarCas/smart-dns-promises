const WITHOUT_CACHE = [
	{ label: 'request', kind: 'step' },
	{ label: 'DNS lookup', kind: 'cost' },
	{ label: 'connect', kind: 'step' },
	{ label: 'response', kind: 'step' }
] as const;

const WITH_CACHE = [
	{ label: 'request', kind: 'step' },
	{ label: 'cache hit', kind: 'win' },
	{ label: 'connect', kind: 'step' },
	{ label: 'response', kind: 'step' }
] as const;

function Track({
	title,
	note,
	steps,
	tone
}: {
	title: string;
	note: string;
	steps: readonly { label: string; kind: string }[];
	tone: 'cost' | 'win';
}) {
	return (
		<div className={`cost-track cost-track--${tone}`}>
			<div className="cost-track__head">
				<span className="mono cost-track__title">{title}</span>
				<span className="cost-track__note">{note}</span>
			</div>
			<ol className="cost-track__steps">
				{steps.map((step, index) => (
					<li key={step.label} className={`cost-step cost-step--${step.kind}`}>
						<span className="cost-step__index mono">{String(index + 1).padStart(2, '0')}</span>
						<span className="cost-step__label">{step.label}</span>
					</li>
				))}
			</ol>
		</div>
	);
}

export function HiddenCost() {
	return (
		<section className="section" id="cost">
			<div className="container">
				<div className="section-head">
					<p className="eyebrow">The invisible cost</p>
					<h2 className="section-title">The expensive part is invisible.</h2>
					<p className="section-lead">
						DNS resolution runs before the connection is opened, so it never appears in your
						request timings. It simply happens — for every host, in every process, on every
						call that does not already know the answer.
					</p>
				</div>

				<div className="cost-grid">
					<Track
						tone="cost"
						title="WITHOUT A CACHE"
						note="the resolver is asked again and again"
						steps={WITHOUT_CACHE}
					/>
					<Track
						tone="win"
						title="WITH SMARTDNS"
						note="the answer is already in memory"
						steps={WITH_CACHE}
					/>
				</div>
			</div>
		</section>
	);
}