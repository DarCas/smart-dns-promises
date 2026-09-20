/*
 * Dario Casertano <dario@casertano.name>
 * Copyright (c) 2026 Casertano Dario – All rights reserved.
 * MIT
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHighlighter } from 'shiki';
import { snippets } from './snippets.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(here, '..', 'src', 'generated');

const THEME = 'vitesse-dark';

const COLOR_REPLACEMENTS = {
    '#758575DD': '#6a8a7a',
};

const highlighter = await createHighlighter({
    langs: ['bash', 'typescript'],
    themes: [THEME],
});

function applyColorReplacements(html) {
    let out = html;
    for (const [from, to] of Object.entries(COLOR_REPLACEMENTS)) {
        out = out.replaceAll(from, to);
    }
    return out;
}

const output = {};

for (const [id, snippet] of Object.entries(snippets)) {
    output[ id ] = {
        code: snippet.code,
        html: applyColorReplacements(
            highlighter.codeToHtml(snippet.code, {
                lang: snippet.lang,
                theme: THEME,
            }),
        ),
        lang: snippet.lang,
    };
}

mkdirSync(outDir, {recursive: true});
writeFileSync(resolve(outDir, 'snippets.json'), `${JSON.stringify(output, null, 4)}\n`);

console.log(`highlight: wrote ${Object.keys(output).length} snippets (${THEME})`);
