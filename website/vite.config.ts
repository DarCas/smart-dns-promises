/*
 * Dario Casertano <dario@casertano.name>
 * Copyright (c) 2026 Casertano Dario – All rights reserved.
 * MIT
 */

import SubResourceIntegrity from "@darcas/rollup-sub-resource-integrity";
import react from '@vitejs/plugin-react';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';

const pluginPkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'))
const sitePkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf-8'))

const InjectSoftwareVersion = () => ( {
    name: 'inject-software-version',
    transformIndexHtml(html: string): string {
        return html.replace(
            /("softwareVersion"\s*:\s*")([^"]*)(")/,
            `$1${pluginPkg.version}$3`,
        )
    },
} )

/**
 * Updates `<lastmod>` in the built sitemap.xml with the build date,
 * so every deployment reports a fresh modification timestamp.
 */
function SitemapLastmod(): Plugin {
    return {
        closeBundle() {
            const file = resolve('dist', 'sitemap.xml')
            const today = new Date().toISOString().slice(0, 10)
            let xml = readFileSync(file, 'utf-8')
            if (/<lastmod>/.test(xml)) {
                xml = xml.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${today}</lastmod>`)
            } else {
                xml = xml.replace('</loc>', `</loc>\n    <lastmod>${today}</lastmod>`)
            }
            writeFileSync(file, xml)
        },
        name: 'sitemap-lastmod',
    }
}

export default defineConfig({
    define: {
        __SITE_VERSION__: JSON.stringify(sitePkg.version),
        __SOFTWARE_VERSION__: JSON.stringify(pluginPkg.version),
    },
    plugins: [
        react(),
        SubResourceIntegrity(),
        InjectSoftwareVersion(),
        SitemapLastmod(),
    ],
    build: {
        target: 'es2022',
    },
});
