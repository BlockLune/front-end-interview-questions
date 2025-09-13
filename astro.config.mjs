// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// https://astro.build/config
export default defineConfig({
	integrations: [
		starlight({
			title: 'Front End Interview Questions',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/BlockLune/front-end-interview-questions' }],
			sidebar: [
				{
					label: '通用面试题',
					autogenerate: { directory: 'common' },
				},
			],
		}),
	],
});
