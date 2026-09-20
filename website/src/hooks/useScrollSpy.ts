import { useEffect, useRef, useState } from 'react';

export function useScrollSpy(ids: readonly string[]): string {
	const [active, setActive] = useState('');
	const visible = useRef(new Set<string>());

	useEffect(() => {
		const elements = ids
			.map((id) => document.getElementById(id))
			.filter((el): el is HTMLElement => el !== null);

		if (elements.length === 0) return;

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						visible.current.add(entry.target.id);
					} else {
						visible.current.delete(entry.target.id);
					}
				}

				const current = elements
					.map((el) => el.id)
					.filter((id) => visible.current.has(id));

				setActive(current.at(-1) ?? '');
			},
			{ rootMargin: '-40% 0px -55% 0px' }
		);

		for (const el of elements) observer.observe(el);
		return () => observer.disconnect();
	}, [ids]);

	return active;
}