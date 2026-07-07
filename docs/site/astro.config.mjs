// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import starlight from '@astrojs/starlight';
import { remarkStripAdrHeading } from './src/remark-strip-adr-heading.mjs';

// https://astro.build/config
export default defineConfig({
	site: 'https://ihbelda.github.io',
	base: '/flowsync',
	markdown: {
		processor: unified({ remarkPlugins: [remarkStripAdrHeading] }),
	},
	integrations: [
		starlight({
			title: 'FlowSync Docs',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/ihbelda/flowsync' }],
			sidebar: [
				{
					label: 'Decisiones (ADRs)',
					items: [{ autogenerate: { directory: 'adr' } }],
				},
				{	
					label: 'Guides',
					items: [
						// Each item here is one entry in the navigation menu.
						{ label: 'Example Guide', slug: 'guides/example' },
					],
				},
				{
					label: 'Reference',
					items: [{ autogenerate: { directory: 'reference' } }],
				},
			],
		}),
	],
});
