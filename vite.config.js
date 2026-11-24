import { sveltekit } from '@sveltejs/kit/vite';
import adapter from '@sveltejs/adapter-node';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// En SvelteKit 3 la configuración del framework se pasa directamente al plugin.
export default defineConfig({
	plugins: [tailwindcss(), sveltekit({
			adapter: adapter(),
			// Política de seguridad de contenido (OWASP ZAP: "CSP Header Not Set").
			// SvelteKit agrega un nonce a sus propios scripts en línea. 'unsafe-inline' en
			// style-src es un riesgo aceptado: los componentes usan style="" para colores y
			// anchos calculados en el servidor (nunca texto del usuario).
			csp: {
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					'style-src': ['self', 'unsafe-inline'],
					'img-src': ['self', 'data:', 'https://upload.wikimedia.org'],
					'font-src': ['self', 'data:'],
					'connect-src': ['self'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self'],
					'frame-ancestors': ['none']
				}
			}
		})],
	test: {
		include: ['tests/**/*.test.js'],
		environment: 'node'
	}
});
