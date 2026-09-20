const RESOLVE_ORDER = [
	{
		state: 'hit',
		tone: 'ok',
		title: 'Valid cache hit',
		body: 'The address is returned straight from the in-memory cache. No resolver contact.'
	},
	{
		state: 'stale',
		tone: 'warn',
		title: 'Stale, still useful',
		body: 'With SWR enabled, an expired entry is served immediately while it refreshes in the background.'
	},
	{
		state: 'negative',
		tone: 'bad',
		title: 'Remembered failure',
		body: 'A recently failed hostname is rejected from the negative cache instead of pressuring the resolver again.'
	},
	{
		state: 'miss',
		tone: 'accent',
		title: 'Real lookup',
		body: 'Only here is a DNS query actually issued. The answer is cached and the record TTL is respected.'
	}
] as const;

export function Mechanism() {
	return (
		<section className="section" id="mechanism">
			<div className="container">
				<div className="section-head">
					<p className="eyebrow">The mechanism</p>
					<h2 className="section-title">A resolver that remembers.</h2>
					<p className="section-lead">
						SmartDns sits between your application and the network. It keeps resolved
						hostnames in a TTL-aware cache, collapses concurrent lookups for the same host
						and only touches the resolver when it actually has to.
					</p>
				</div>

				<figure className="arch">
					<div className="arch__flow">
						<div className="arch__node">
							<span className="arch__cap">Node.js app</span>
							<span className="arch__sub">fetch · axios · http</span>
						</div>

						<span className="arch__edge" aria-hidden="true">
							<span className="arch__edge-line" />
							<span className="arch__edge-label mono">resolver(url)</span>
						</span>

						<div className="arch__node arch__node--core">
							<span className="arch__cap">SmartDns</span>
							<ul className="arch__chips">
								<li>cache</li>
								<li>deduplication</li>
								<li>TTL</li>
								<li>SWR</li>
								<li>statistics</li>
							</ul>
						</div>

						<span className="arch__edge" aria-hidden="true">
							<span className="arch__edge-line" />
							<span className="arch__edge-label mono">query, on miss only</span>
						</span>

						<div className="arch__node">
							<span className="arch__cap">DNS provider</span>
							<span className="arch__sub">9 public providers · or custom servers</span>
						</div>
					</div>
					<figcaption className="arch__caption mono">
						One module, resolved before the request leaves the process.
					</figcaption>
				</figure>

				<ol className="order">
					{RESOLVE_ORDER.map((item, index) => (
						<li key={item.state} className="order__row">
							<span className="order__index mono">{String(index + 1).padStart(2, '0')}</span>
							<span className={`order__state order__state--${item.tone} mono`}>
								{item.state.toUpperCase()}
							</span>
							<span className="order__body">
								<span className="order__title">{item.title}</span>
								<span className="order__text">{item.body}</span>
							</span>
						</li>
					))}
				</ol>
			</div>
		</section>
	);
}