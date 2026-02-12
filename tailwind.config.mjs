/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme');

export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			// 1. TIPOGRAFÍA CORPORATIVA
			fontFamily: {
				// Al poner Montserrat primero, reemplaza a la fuente por defecto. Si no está disponible, usa la siguiente de la lista.
				sans: ['Montserrat', ...defaultTheme.fontFamily.sans],
			},
			// 2. COLORES CORPORATIVOS
			colors: {
				// Reemplazamos la paleta 'blue' entera por la de TPH
				blue: {
					50:  '#ebefff', // Fondos muy suaves (para secciones alternas)
					100: '#dce4ff',
					200: '#becdff',
					300: '#92aaff',
					400: '#5e7eff',
					500: '#3352ff',
					600: '#0025A7', // <--- AZUL EXACTO CORPORATIVO (Botones y enlaces)
					700: '#001d85', // <--- Hover de botones (Un poco más oscuro)
					800: '#00186b',
					900: '#001556', // Navbar oscuro o footer
					950: '#000d36',
				},
				// Ajustamos los grises a los complementarios
				gray: {
					50:  '#f9fafb',
					100: '#f3f4f6',
					200: '#e5e7eb',
					300: '#d1d5db',
					400: '#8c8c8c', // <--- GRIS MEDIO (Textos secundarios)
					500: '#6b7280',
					600: '#4d4d4d', // <--- GRIS OSCURO (Textos principales suaves)
					700: '#374151', 
					800: '#1f2937', // Textos casi negros
					900: '#111827',
					950: '#030712',
				},
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
	],
}