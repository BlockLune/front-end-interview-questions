// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import { remarkAlert } from 'remark-github-blockquote-alert';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';

// https://astro.build/config
export default defineConfig({
  markdown: {
    remarkPlugins: [remarkAlert, remarkMath],
    rehypePlugins: [rehypeMathjax],
  },
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
      customCss: [
        './src/styles/global.css'
      ]
		}),
	],
});
