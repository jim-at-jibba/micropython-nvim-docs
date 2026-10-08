// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightLinksValidator from 'starlight-links-validator';

// https://astro.build/config
export default defineConfig({
	site: 'https://jim-at-jibba.github.io',
	base: '/micropython-nvim-docs',
	integrations: [
		starlight({
			title: 'micropython.nvim',
			description: 'Write, run and upload MicroPython code on a device without leaving Neovim.',
			plugins: [starlightLinksValidator()],
			social: [
				{
					icon: 'github',
					label: 'micropython.nvim on GitHub',
					href: 'https://github.com/jim-at-jibba/micropython.nvim',
				},
			],
			editLink: {
				baseUrl: 'https://github.com/jim-at-jibba/micropython-nvim-docs/edit/main/',
			},
			// One folder per section under src/content/docs: new pages join the sidebar on their own.
			sidebar: [
				{ label: 'Getting started', items: [{ autogenerate: { directory: 'getting-started' } }] },
				{ label: 'Commands', items: [{ autogenerate: { directory: 'commands' } }] },
				{ label: 'Configuration', items: [{ autogenerate: { directory: 'configuration' } }] },
				{ label: 'Playbook', items: [{ autogenerate: { directory: 'playbook' } }] },
				{ label: 'Troubleshooting', items: [{ autogenerate: { directory: 'troubleshooting' } }] },
				{
					label: 'Migrating from v2',
					items: [{ autogenerate: { directory: 'migrating-from-v2' } }],
				},
			],
		}),
	],
});
