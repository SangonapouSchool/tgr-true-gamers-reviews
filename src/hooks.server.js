import { getDb } from '#lib/server/db.js';
import { getSessionUser, SESSION_COOKIE } from '#lib/server/auth.js';

/** Carga el usuario de la sesión en cada petición. */
export async function handle({ event, resolve }) {
	const db = getDb();
	event.locals.db = db;
	event.locals.user = getSessionUser(db, event.cookies.get(SESSION_COOKIE));
	return resolve(event);
}
