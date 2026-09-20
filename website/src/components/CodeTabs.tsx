import { useRef, useState } from 'react';
import snippets from '../generated/snippets.json';
import { CopyButton } from './CopyButton';

interface CodeTabsProps {
	tabs: readonly { id: string; label: string; caption?: string; snippetId?: string }[];
	label?: string;
}

type SnippetMap = Record<string, { lang: string; code: string; html: string }>;

const map = snippets as SnippetMap;

export function CodeTabs({ tabs, label = 'Code examples' }: CodeTabsProps) {
	const [active, setActive] = useState(tabs[0]?.id ?? '');
	const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

	const focusTab = (index: number) => {
		const next = tabs[(index + tabs.length) % tabs.length];
		setActive(next.id);
		tabRefs.current[next.id]?.focus();
	};

	return (
		<div className="code-card">
			<div className="code-tabs__list" role="tablist" aria-label={label}>
				{tabs.map((tab, index) => {
					const selected = tab.id === active;
					return (
						<button
							key={tab.id}
							ref={(el) => {
								tabRefs.current[tab.id] = el;
							}}
							type="button"
							role="tab"
							id={`tab-${tab.id}`}
							aria-selected={selected}
							aria-controls={`panel-${tab.id}`}
							tabIndex={selected ? 0 : -1}
							className="code-tabs__tab"
							onClick={() => setActive(tab.id)}
							onKeyDown={(event) => {
								if (event.key === 'ArrowRight') {
									event.preventDefault();
									focusTab(index + 1);
								} else if (event.key === 'ArrowLeft') {
									event.preventDefault();
									focusTab(index - 1);
								} else if (event.key === 'Home') {
									event.preventDefault();
									focusTab(0);
								} else if (event.key === 'End') {
									event.preventDefault();
									focusTab(tabs.length - 1);
								}
							}}
						>
							{tab.label}
						</button>
					);
				})}
			</div>

			{tabs.map((tab) => {
				const snippet = map[tab.snippetId ?? tab.id];
				if (!snippet) return null;
				return (
					<div
						key={tab.id}
						role="tabpanel"
						id={`panel-${tab.id}`}
						aria-labelledby={`tab-${tab.id}`}
						hidden={tab.id !== active}
					>
						<div className="code-card__head">
							<span className="code-card__cap">{tab.caption ?? snippet.lang}</span>
							<CopyButton code={snippet.code} />
						</div>
						<pre>
							<code dangerouslySetInnerHTML={{ __html: snippet.html }} />
						</pre>
					</div>
				);
			})}
		</div>
	);
}