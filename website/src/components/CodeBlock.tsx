import snippets from '../generated/snippets.json';
import { CopyButton } from './CopyButton';

interface CodeBlockProps {
	id: string;
	caption?: string;
	copy?: boolean;
}

type SnippetMap = Record<string, { lang: string; code: string; html: string }>;

const map = snippets as SnippetMap;

export function CodeBlock({ id, caption, copy = true }: CodeBlockProps) {
	const snippet = map[id];

	if (!snippet) return null;

	return (
		<figure className="code-card">
			{caption || copy ? (
				<figcaption className="code-card__head">
					{caption ? <span className="code-card__cap">{caption}</span> : <span />}
					{copy ? <CopyButton code={snippet.code} /> : null}
				</figcaption>
			) : null}
			<pre>
				<code dangerouslySetInnerHTML={{ __html: snippet.html }} />
			</pre>
		</figure>
	);
}