const ROUTES = [
	'M -60 180 H 400 L 560 320 H 1000 L 1150 200 H 1500',
	'M 1500 520 H 1050 L 880 640 H 520 L 380 520 H -60',
	'M 200 960 V 620 L 340 480 V 120 L 520 -60',
	'M 1240 960 V 700 L 1100 560 V 260',
	'M -60 700 H 300 L 460 820 H 900 L 1040 700 H 1500',
] as const

const NODES = [
	[400, 180, true],
	[1000, 320, false],
	[1150, 200, true],
	[880, 640, false],
	[520, 640, true],
	[380, 520, false],
	[340, 480, false],
	[340, 120, true],
	[1100, 560, false],
	[300, 700, false],
	[1040, 700, true],
	[900, 820, false],
] as const

const PACKETS = [
	{ d: ROUTES[0], duration: '16s', delay: '0s' },
	{ d: ROUTES[3], duration: '22s', delay: '5s' },
	{ d: ROUTES[4], duration: '19s', delay: '10s' },
] as const

export function Background() {
	return (
		<div className="bg" aria-hidden="true">
			<svg
				className="bg__map"
				viewBox="0 0 1440 900"
				preserveAspectRatio="xMidYMid slice"
			>
				{ROUTES.map((d) => (
					<path key={d} className="bg__route" d={d} />
				))}
				{NODES.map(([cx, cy, live]) => (
					<circle
						key={`${cx}-${cy}`}
						className={live ? 'bg__node bg__node--live' : 'bg__node'}
						cx={cx}
						cy={cy}
						r="2.5"
					/>
				))}
				{PACKETS.map((packet) => (
					<path
						key={packet.duration}
						className="bg__packet"
						d={packet.d}
						style={{ animationDuration: packet.duration, animationDelay: packet.delay }}
					/>
				))}
			</svg>
		</div>
	);
}
