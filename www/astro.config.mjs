import mdx from "@astrojs/mdx";
import react from '@astrojs/react';
import sitemap from "@astrojs/sitemap";
import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeExternalLinks from "rehype-external-links";
import rehypeSlug from "rehype-slug";
import remarkCodeTitles from "remark-code-titles";

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
markdown: {
    remarkPlugins: [remarkCodeTitles],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
          rel: ["noreferrer noopener"],
          content: {
            type: "text",
            value: "↗",
          },
        },
      ],
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            class: "heading-link heading-link--hidden---effects",
            "data-heading-link": true,
          },
          behavior: "wrap",
        },
      ],
    ],
    shikiConfig: {
      theme: "rose-pine",
      wrap: true,
    },
  },
  integrations: [react(), sitemap(), mdx()],
  vite: {
    optimizeDeps: {
      exclude: ["@resvg/resvg-js"],
    },
  },
});