import { useCallback, useState } from 'react';

interface CopyButtonProps {
	code: string;
	label?: string;
}

export function CopyButton({ code, label = 'Copy' }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const onCopy = useCallback(async () => {
		try {
			await navigator.clipboard.writeText(code);
			setCopied(true);
			window.setTimeout(() => setCopied(false), 1600);
		} catch {
			setCopied(false);
		}
	}, [code]);

	return (
		<button
			type="button"
			className="copy-btn"
			data-copied={copied}
			onClick={onCopy}
			aria-label={copied ? 'Copied to clipboard' : label}
		>
			{copied ? 'Copied' : label}
		</button>
	);
}