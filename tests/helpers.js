import { openDb } from '../src/lib/server/db.js';
import { seed } from '../scripts/seed.js';
import { getUser } from '../src/lib/server/repo.js';

/** Base de datos en memoria con los datos de demostración. */
export function freshDb() {
	const db = openDb(':memory:');
	seed(db);
	return db;
}

/** Busca un usuario sembrado por nombre. */
export function userByName(db, username) {
	const { id } = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
	return getUser(db, id);
}

export function gameByTitle(db, title) {
	return db.prepare('SELECT * FROM games WHERE title = ?').get(title);
}
