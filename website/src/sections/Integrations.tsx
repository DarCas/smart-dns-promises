import { CodeTabs } from '../components/CodeTabs';
import { GITHUB_URL } from '../lib/links';
import { axiosSnippetId, fetchSnippetId } from '../lib/providers';
import type { ProviderId } from '../lib/providers';

interface IntegrationsProps {
	provider: ProviderId;
}

export function Integrations({ provider }: IntegrationsProps) {
	const tabs = [
		{
			id: 'axios',
			label: 'Axios',
			caption: 'request interceptor',
			snippetId: axiosSnippetId(provider)
		},
		{
			id: 'fetch',
			label: 'Fetch',
			caption: 'manual resolution',
			snippetId: fetchSnippetId(provider)
		}
	] as const;

	return (
		<section className="section" id="integration">
			<div className="container">
				<div className="integration__grid">
					<div className="section-head integration__head">
						<p className="eyebrow">Integration</p>
						<h2 className="section-title">It sits before the request.</h2>
						<p className="section-lead">
							SmartDns does not replace your HTTP client. It resolves the hostname first,
							then hands the client a URL that already points at the address. The original
							hostname travels in the Host header.
						</p>

						<aside className="aside-note aside-note--warn">
							<span className="aside-note__label mono">FETCH CAVEAT</span>
							<p>
								Replacing the host with a raw IP means TLS is negotiated against that IP.
								Prefer the interceptor for public HTTPS. The direct approach is useful for
								plain HTTP and controlled environments.
							</p>
						</aside>

						<a className="btn btn--quiet" href={GITHUB_URL} target="_blank" rel="noreferrer noopener">
							Full examples in the README <span className="btn__arrow">↗</span>
						</a>
					</div>

					<div className="integration__code">
						<CodeTabs tabs={tabs} label="HTTP client integration" />
					</div>
				</div>
			</div>
		</section>
	);
}