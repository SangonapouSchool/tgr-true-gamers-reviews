import { dev } from '$app/environment';
import { createSession, SESSION_COOKIE } from './auth.js';

/** Inicia sesión: crea la sesión y guarda la cookie httpOnly. */
export function startSession(cookies, db, userId) {
	const s = createSession(db, userId);
	cookies.set(SESSION_COOKIE, s.id, { path: '/', httpOnly: true, sameSite: 'lax', secure: !dev, expires: s.expires });
}

/** Sólo permite redirigir a rutas internas (evita redirecciones abiertas). */
export function safeRedirect(to) {
	return typeof to === 'string' && to.startsWith('/') && !to.startsWith('//') ? to : '/';
}
