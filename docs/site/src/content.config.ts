import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { readFileSync } from 'node:fs';
import { sep } from 'node:path';
import type { Loader, LoaderContext, ParseDataOptions } from 'astro/loaders';

// `src/content/docs/adr` is a symlink to the log4brains-managed `docs/adr` folder.
// Log4brains' MADR files carry their title as a `# Heading` in the body instead of
// frontmatter, so Starlight's schema (which requires `title`) rejects them as-is.
// This wraps the default docs loader to backfill `title` from that heading, without
// touching the log4brains-owned files (so `log4brains preview`/`build` stay unaffected).
function docsLoaderWithAdrTitleFallback(): Loader {
	const base = docsLoader();
	return {
		...base,
		name: 'docs-loader-with-adr-title-fallback',
		load(context: LoaderContext) {
			return base.load({
				...context,
				parseData: (async ({ id, data, filePath }: ParseDataOptions<Record<string, unknown>>) => {
					if (!data.title && filePath && filePath.split(sep).includes('adr')) {
						const heading = readFileSync(filePath, 'utf-8').match(/^#\s+(.+)$/m);
						if (heading) data = { ...data, title: heading[1].trim() };
					}
					return context.parseData({ id, data, filePath });
				}) as LoaderContext['parseData'],
			});
		},
	};
}

export const collections = {
	docs: defineCollection({ loader: docsLoaderWithAdrTitleFallback(), schema: docsSchema() }),
};
