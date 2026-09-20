interface BrandMarkProps {
	className?: string;
	size?: number;
}

/*
 * Mark: a resolution route. The outlined node is the resolver, the cyan node
 * is the cached answer, and the cyan edge is the shortcut the cache provides.
 */
export function BrandMark({ className, size = 26 }: BrandMarkProps) {
	return (
		<svg
			className={className}
			width={size}
			height={size}
			viewBox="0 0 32 32"
			role="img"
			aria-hidden="true"
			focusable="false"
		>
			<rect x="1.5" y="1.5" width="29" height="29" rx="3" fill="none" stroke="var(--rule-strong)" />
			<path d="M8 21 16 11l8 10" fill="none" stroke="var(--text-dim)" strokeWidth="1.3" strokeLinejoin="round" />
			<path d="M8 21h16" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" />
			<circle cx="8" cy="21" r="2" fill="var(--text)" />
			<circle cx="16" cy="11" r="2" fill="var(--bg)" stroke="var(--text-dim)" strokeWidth="1.3" />
			<circle cx="24" cy="21" r="2" fill="var(--accent)" />
		</svg>
	);
}