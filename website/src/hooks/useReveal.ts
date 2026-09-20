import { useEffect, useRef, useState } from 'react';

export function usePrefersReducedMotion(): boolean {
	const [reduced, setReduced] = useState(false);

	useEffect(() => {
		const query = window.matchMedia('(prefers-reduced-motion: reduce)');
		const update = () => setReduced(query.matches);

		update();
		query.addEventListener('change', update);
		return () => query.removeEventListener('change', update);
	}, []);

	return reduced;
}

export function useReveal<T extends HTMLElement>() {
	const ref = useRef<T | null>(null);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		if (typeof IntersectionObserver === 'undefined') {
			el.classList.add('is-visible');
			return;
		}

		el.classList.add('reveal-init');

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				}
			},
			{ threshold: 0.12 }
		);

		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return ref;
}