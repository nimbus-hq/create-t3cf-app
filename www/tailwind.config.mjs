/** @type {import('tailwindcss').Config} */
export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	theme: {
		extend: {
      colors: {
        cfdark: "#404041",
        cforange: "#F48120",
        cfyellow: "#FAAD3F",
      },
    },
	},
	plugins: [],
};
