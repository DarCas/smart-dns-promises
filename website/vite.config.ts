import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

const here = dirname(fileURLToPath(import.meta.url));
const sitePkg = JSON.parse(readFileSync(resolve(here, 'package.json'), 'utf8'));
const libraryPkg = JSON.parse(readFileSync(resolve(here, '..', 'package.json'), 'utf8'));

let SubResourceIntegrity: (options?: Record<string, unknown>) => Plugin;
try {
	SubResourceIntegrity = require('@darcas/rollup-sub-resource-integrity').default;
} catch {
	SubResourceIntegrity = () => ({ name: 'noop-sri' });
}

function InjectSoftwareVersion(): Plugin {
	return {
		name: 'inject-software-version',
		transformIndexHtml(html) {
			return html.replace(
				/("softwareVersion"\s*:\s*")([^"]*)(")/,
				`$1${libraryPkg.version}$3`
			);
		}
	};
}

function SitemapLastmod(): Plugin {
	return {
		name: 'sitemap-lastmod',
		closeBundle() {
			const sitemap = resolve(here, 'dist', 'sitemap.xml');
			if (!existsSync(sitemap)) return;
			const today = new Date().toISOString().slice(0, 10);
			let xml = readFileSync(sitemap, 'utf8');
			if (/<lastmod>/.test(xml)) {
				xml = xml.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${today}</lastmod>`);
			} else {
				xml = xml.replace(/(<\/loc>)/, `$1\n    <lastmod>${today}</lastmod>`);
			}
			writeFileSync(sitemap, xml);
		}
	};
}

export default defineConfig({
	define: {
		__SITE_VERSION__: JSON.stringify(sitePkg.version),
		__SOFTWARE_VERSION__: JSON.stringify(libraryPkg.version)
	},
	plugins: [react(), SubResourceIntegrity(), InjectSoftwareVersion(), SitemapLastmod()],
	build: {
		target: 'es2022'
	}
});