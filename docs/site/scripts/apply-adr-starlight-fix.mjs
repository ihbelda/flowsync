#!/usr/bin/env node
// Re-applies the log4brains/Starlight compatibility fix and starts the docs dev server.
//
// Context: `src/content/docs/adr` is a symlink to the log4brains-managed `docs/adr`
// folder. Log4brains' MADR files carry their title as a `# Heading` in the body
// instead of frontmatter, which Starlight's content schema rejects (missing `title`).
// The fix patches `src/content.config.ts`, adds `src/remark-strip-adr-heading.mjs`,
// and wires it into `astro.config.mjs` — all without touching the log4brains-owned
// files in `docs/adr`, so `log4brains preview`/`build` stay unaffected.
//
// Run this after a fresh checkout/reset of `docs/site` (e.g. if it gets regenerated
// from the plain Starlight template and loses this fix):
//   node scripts/apply-adr-starlight-fix.mjs
// or: npm run fix:adr

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const siteRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const contentConfigPath = join(siteRoot, 'src/content.config.ts');
const remarkPluginPath = join(siteRoot, 'src/remark-strip-adr-heading.mjs');
const astroConfigPath = join(siteRoot, 'astro.config.mjs');

const CONTENT_CONFIG =
	[
		"import { defineCollection } from 'astro:content';",
		"import { docsLoader } from '@astrojs/starlight/loaders';",
		"import { docsSchema } from '@astrojs/starlight/schema';",
		"import { readFileSync } from 'node:fs';",
		"import { sep } from 'node:path';",
		"import type { Loader, LoaderContext, ParseDataOptions } from 'astro/loaders';",
		'',
		'// `src/content/docs/adr` is a symlink to the log4brains-managed `docs/adr` folder.',
		"// Log4brains' MADR files carry their title as a `# Heading` in the body instead of",
		"// frontmatter, so Starlight's schema (which requires `title`) rejects them as-is.",
		'// This wraps the default docs loader to backfill `title` from that heading, without',
		'// touching the log4brains-owned files (so `log4brains preview`/`build` stay unaffected).',
		'function docsLoaderWithAdrTitleFallback(): Loader {',
		'\tconst base = docsLoader();',
		'\treturn {',
		'\t\t...base,',
		"\t\tname: 'docs-loader-with-adr-title-fallback',",
		'\t\tload(context: LoaderContext) {',
		'\t\t\treturn base.load({',
		'\t\t\t\t...context,',
		'\t\t\t\tparseData: (async ({ id, data, filePath }: ParseDataOptions<Record<string, unknown>>) => {',
		"\t\t\t\t\tif (!data.title && filePath && filePath.split(sep).includes('adr')) {",
		"\t\t\t\t\t\tconst heading = readFileSync(filePath, 'utf-8').match(/^#\\s+(.+)$/m);",
		'\t\t\t\t\t\tif (heading) data = { ...data, title: heading[1].trim() };',
		'\t\t\t\t\t}',
		'\t\t\t\t\treturn context.parseData({ id, data, filePath });',
		"\t\t\t\t}) as LoaderContext['parseData'],",
		'\t\t\t});',
		'\t\t},',
		'\t};',
		'}',
		'',
		'export const collections = {',
		'\tdocs: defineCollection({ loader: docsLoaderWithAdrTitleFallback(), schema: docsSchema() }),',
		'};',
		'',
	].join('\n');

const REMARK_PLUGIN =
	[
		'// Log4brains ADRs use a leading `# Heading` as their title instead of frontmatter.',
		'// content.config.ts backfills `title` from that heading, so Starlight already renders',
		"// it as the page's `<h1>`. Strip the same heading from the body here to avoid showing it twice.",
		'export function remarkStripAdrHeading() {',
		'\treturn (tree, file) => {',
		"\t\tconst filePath = file.path ?? file.history?.[0] ?? '';",
		"\t\tif (!/[\\\\/]content[\\\\/]docs[\\\\/]adr[\\\\/]/.test(filePath)) return;",
		'',
		'\t\tconst first = tree.children[0];',
		"\t\tif (first?.type === 'heading' && first.depth === 1) {",
		'\t\t\ttree.children.shift();',
		'\t\t}',
		'\t};',
		'}',
		'',
	].join('\n');

function writeIfChanged(path, content, label) {
	if (existsSync(path) && readFileSync(path, 'utf8') === content) {
		console.log(`already up to date: ${label}`);
		return;
	}
	writeFileSync(path, content);
	console.log(`wrote: ${label}`);
}

writeIfChanged(contentConfigPath, CONTENT_CONFIG, 'src/content.config.ts');
writeIfChanged(remarkPluginPath, REMARK_PLUGIN, 'src/remark-strip-adr-heading.mjs');

let astroConfig = readFileSync(astroConfigPath, 'utf8');
if (astroConfig.includes('remarkStripAdrHeading')) {
	console.log('already patched: astro.config.mjs');
} else if (astroConfig.includes('markdown:')) {
	console.warn(
		'astro.config.mjs already defines a `markdown` key without `remarkStripAdrHeading` — skipping ' +
			'to avoid clobbering your config. Add `processor: unified({ remarkPlugins: [remarkStripAdrHeading] })` ' +
			'to it by hand.'
	);
} else if (
	!astroConfig.includes("import starlight from '@astrojs/starlight';") ||
	!astroConfig.includes('export default defineConfig({')
) {
	console.warn('astro.config.mjs has an unexpected shape — apply the fix manually.');
} else {
	astroConfig = astroConfig
		.replace(
			"import starlight from '@astrojs/starlight';",
			"import { unified } from '@astrojs/markdown-remark';\n" +
				"import starlight from '@astrojs/starlight';\n" +
				"import { remarkStripAdrHeading } from './src/remark-strip-adr-heading.mjs';"
		)
		.replace(
			'export default defineConfig({',
			'export default defineConfig({\n' +
				'\tmarkdown: {\n' +
				'\t\tprocessor: unified({ remarkPlugins: [remarkStripAdrHeading] }),\n' +
				'\t},'
		);
	writeFileSync(astroConfigPath, astroConfig);
	console.log('patched: astro.config.mjs');
}

console.log('starting Astro dev server in background...');
const result = spawnSync('npx', ['astro', 'dev', '--background'], {
	cwd: siteRoot,
	stdio: 'inherit',
});
process.exit(result.status ?? 0);
