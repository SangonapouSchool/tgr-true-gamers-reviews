import { getDb } from '#lib/server/db.js';
import { getSessionUser, SESSION_COOKIE } from '#lib/server/auth.js';

/** Carga el usuario de la sesión en cada petición. */
export async function handle({ event, resolve }) {
	const db = getDb();
	event.locals.db = db;
	event.locals.user = getSessionUser(db, event.cookies.get(SESSION_COOKIE));
	const response = await resolve(event);
	// Cabeceras de seguridad (hallazgos de OWASP ZAP)
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	return response;
}
