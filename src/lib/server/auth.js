/**
 * Autenticación: contraseñas cifradas con scrypt + sal aleatoria (RNF5) y sesiones por cookie.
 */
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

const KEYLEN = 64;
export const SESSION_COOKIE = 'tgr_session';
export const SESSION_DAYS = 30;

/** @param {string} password */
export function hashPassword(password) {
	const salt = randomBytes(16).toString('hex');
	const hash = scryptSync(password, salt, KEYLEN).toString('hex');
	return `scrypt$${salt}$${hash}`;
}

/** @param {string} password @param {string} stored */
export function verifyPassword(password, stored) {
	const [algo, salt, hash] = String(stored).split('$');
	if (algo !== 'scrypt' || !salt || !hash) return false;
	const expected = Buffer.from(hash, 'hex');
	const actual = scryptSync(password, salt, expected.length);
	return expected.length === actual.length && timingSafeEqual(expected, actual);
}

/** Crea una sesión y regresa su token. */
export function createSession(db, userId) {
	const id = randomBytes(32).toString('hex');
	const expires = Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000;
	db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(id, userId, expires);
	return { id, expires: new Date(expires) };
}

/** Usuario dueño de un token de sesión vigente, o null. */
export function getSessionUser(db, token) {
	if (!token) return null;
	const row = db
		.prepare(
			`SELECT u.id, u.username, u.email, u.role, u.status, u.outlet, s.expires_at
			 FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.id = ?`
		)
		.get(token);
	if (!row) return null;
	if (row.expires_at < Date.now()) {
		db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
		return null;
	}
	const { expires_at, ...user } = row;
	return { ...user };
}

export function deleteSession(db, token) {
	if (token) db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
}
