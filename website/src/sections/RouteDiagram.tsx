export function RouteDiagram() {
	return (
		<figure className="route">
			<figcaption className="route__caption">
				<span className="mono">THE ROUTE BEFORE THE REQUEST</span>
				<span className="route__caption-note mono">REQ 01 · REQ 02</span>
			</figcaption>

			<svg
				className="route__svg"
				viewBox="0 0 620 280"
				role="img"
				aria-label="The first request resolves a hostname through a DNS resolver. The next request for the same host is served from the cache, taking a shorter route straight to the IP address."
			>
				{/* base wiring */}
				<path className="route__wire" d="M104 200 H400 V80 H438" />
				<path className="route__wire" d="M517 112 V168" />
				<path className="route__shortcut" d="M104 200 H438" />

				{/* travelling pulses */}
				<path className="route__pulse route__pulse--miss-a" d="M104 200 H400 V80 H438" />
				<path className="route__pulse route__pulse--miss-b" d="M517 112 V168" />
				<path className="route__pulse route__pulse--hit" d="M104 200 H438" />

				{/* nodes */}
				<g className="route__node">
					<rect x="16" y="172" width="88" height="56" rx="3" />
					<text x="60" y="205" textAnchor="middle">APP</text>
				</g>

				<g className="route__node route__node--core">
					<rect x="176" y="142" width="168" height="116" rx="3" />
					<text x="260" y="180" textAnchor="middle" className="route__node-title">SMARTDNS</text>
					<text x="260" y="203" textAnchor="middle" className="route__node-sub">cache · dedupe</text>
					<text x="260" y="221" textAnchor="middle" className="route__node-sub">ttl · swr · stats</text>
				</g>

				<g className="route__node route__node--resolver">
					<rect x="438" y="48" width="158" height="64" rx="3" />
					<text x="517" y="74" textAnchor="middle" className="route__node-title">RESOLVER</text>
					<text x="517" y="94" textAnchor="middle" className="route__node-sub">1.1.1.1</text>
				</g>

				<g className="route__node route__node--ip">
					<rect x="438" y="168" width="158" height="64" rx="3" />
					<text x="517" y="194" textAnchor="middle" className="route__node-title">IP</text>
					<text x="517" y="214" textAnchor="middle" className="route__node-sub">142.250.72.14</text>
				</g>

				{/* phase tags */}
				<text className="route__tag route__tag--miss" x="414" y="70" textAnchor="end">
					MISS
				</text>
				<text className="route__tag route__tag--hit" x="392" y="190" textAnchor="end">
					HIT
				</text>
			</svg>

			<div className="route__legend">
				<div className="route__legend-item route__legend-item--miss">
					<span className="route__legend-key mono">REQ 01</span>
					<span className="route__legend-dot route__legend-dot--miss" aria-hidden="true" />
					<span className="route__legend-text">cache miss · resolver lookup</span>
				</div>
				<div className="route__legend-item route__legend-item--hit">
					<span className="route__legend-key mono">REQ 02</span>
					<span className="route__legend-dot route__legend-dot--hit" aria-hidden="true" />
					<span className="route__legend-text">cache hit · shortest path</span>
				</div>
			</div>
		</figure>
	);
}