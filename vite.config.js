import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-node';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// En SvelteKit 3 la configuración del framework se pasa directamente al plugin.
export default defineConfig({
	plugins: [tailwindcss(), sveltekit({ adapter: adapter() })],
	test: {
		include: ['tests/**/*.test.js'],
		environment: 'node'
	}
});
