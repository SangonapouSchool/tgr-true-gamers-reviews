import { redirect } from '@sveltejs/kit';
import { deleteSession, SESSION_COOKIE } from '#lib/server/auth.js';

/** Cierra la sesión actual. */
export function POST({ cookies, locals }) {
	deleteSession(locals.db, cookies.get(SESSION_COOKIE));
	cookies.delete(SESSION_COOKIE, { path: '/' });
	redirect(303, '/');
}
