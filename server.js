/**
 * Servidor de producción de TGR (uso: `npm start` después de `npm run build`).
 *
 * Envuelve el handler de adapter-node para:
 *  1. Indicar que la app se sirve por http. adapter-node asume https por defecto y,
 *     sin esto, la protección CSRF de SvelteKit rechaza los formularios (403) en
 *     http://localhost. Si se publica detrás de un proxy con https, define
 *     PROTOCOL=https.
 *  2. Agregar cabeceras de seguridad también a los archivos estáticos
 *     (hallazgos de OWASP ZAP: X-Content-Type-Options y anti-clickjacking).
 */
import http from 'node:http';

const PROTO_HEADER = 'x-tgr-protocol';
const protocol = process.env.PROTOCOL || 'http';
process.env.PROTOCOL_HEADER = PROTO_HEADER;
const { handler } = await import('./build/handler.js');

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

http
	.createServer((req, res) => {
		// Se sobrescribe siempre: el cliente no puede falsear el protocolo.
		req.headers[PROTO_HEADER] = protocol;
		res.setHeader('X-Content-Type-Options', 'nosniff');
		res.setHeader('X-Frame-Options', 'DENY');
		res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
		handler(req, res);
	})
	.listen(port, host, () => console.log(`TGR escuchando en http://localhost:${port}`));
