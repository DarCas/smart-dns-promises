import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const indexPath = resolve(root, 'dist', 'index.html');

const PLACEHOLDER = '<div id="root"></div>';

const vite = await createServer({
	root,
	server: { middlewareMode: true },
	appType: 'custom',
	logLevel: 'error'
});

try {
	const { App } = await vite.ssrLoadModule('/src/App.tsx');
	const markup = renderToString(createElement(App));

	const html = readFileSync(indexPath, 'utf8');
	if (!html.includes(PLACEHOLDER)) {
		throw new Error(`prerender: placeholder ${PLACEHOLDER} not found in dist/index.html`);
	}

	writeFileSync(indexPath, html.replace(PLACEHOLDER, `<div id="root">${markup}</div>`));
	console.log(`prerender: injected ${markup.length} bytes into dist/index.html`);
} finally {
	await vite.close();
}