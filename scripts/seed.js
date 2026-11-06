/**
 * Crea (o recrea) la base de datos con datos de demostración.
 * Uso: npm run seed            → data/tgr.db
 *      TGR_DB=otra.db npm run seed
 */
import { openDb, DB_FILE, SCHEMA } from '../src/lib/server/db.js';
import { hashPassword } from '../src/lib/server/auth.js';
import { normalizeScore } from '../src/lib/scoring.js';
import { slugify } from '../src/lib/validation.js';
import { USERS, GAMES, OFFICIAL, OUTLET, RATERS, RATINGS, COMMENTS } from './seed-data.js';

export function seed(db) {
	db.exec('BEGIN');
	try {
		const userId = {};
		const insUser = db.prepare('INSERT INTO users (username, email, password_hash, role, status, outlet) VALUES (?, ?, ?, ?, ?, ?)');
		for (const u of USERS) {
			const r = insUser.run(u.username, u.email, hashPassword(u.password), u.role ?? 'user', u.status ?? 'active', u.outlet ?? null);
			userId[u.username] = Number(r.lastInsertRowid);
		}
		const outletEditor = Object.fromEntries(USERS.filter((u) => u.outlet).map((u) => [u.outlet, userId[u.username]]));

		const gameId = {};
		const insGame = db.prepare('INSERT INTO games (title, slug, genre, year, developer, synopsis, cover_hue) VALUES (?, ?, ?, ?, ?, ?, ?)');
		const insPlat = db.prepare('INSERT INTO game_platforms (game_id, platform) VALUES (?, ?)');
		for (const [title, genre, year, developer, platforms, hue, synopsis] of GAMES) {
			const id = Number(insGame.run(title, slugify(title), genre, year, developer, synopsis, hue).lastInsertRowid);
			gameId[title] = id;
			for (const p of platforms) insPlat.run(id, p);
		}

		// Fechas escalonadas para que "Reseñas recientes" tenga un orden natural
		let daysAgo = 40;
		const insReview = db.prepare(
			`INSERT INTO reviews (game_id, author_id, kind, outlet, title, body, pros, cons, verdict, score_raw, score_max, score, published_at, updated_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))`
		);
		for (const [title, r] of Object.entries(OFFICIAL)) {
			const when = `-${(daysAgo -= 3)} days`;
			insReview.run(gameId[title], userId.sofia_tgr, 'official', null, r.title, r.body, r.pros, r.cons, r.verdict, r.score, 5, normalizeScore(r.score, 5), when, when);
		}
		const scale = { PixelPress: 10, 'Modo Retro': 100, 'Control Total': 5 };
		for (const [title, outlet, raw, body] of OUTLET) {
			const when = `-${Math.max(1, (daysAgo -= 1))} days`;
			const max = scale[outlet];
			insReview.run(gameId[title], outletEditor[outlet], 'outlet', outlet, `Reseña de ${outlet}`, body, '', '', body.split('.')[0] + '.', raw, max, normalizeScore(raw, max), when, when);
		}

		const insRating = db.prepare('INSERT INTO ratings (user_id, game_id, stars) VALUES (?, ?, ?)');
		for (const [title, stars] of Object.entries(RATINGS)) {
			stars.forEach((s, i) => insRating.run(userId[RATERS[i]], gameId[title], s));
		}

		const insComment = db.prepare("INSERT INTO comments (game_id, user_id, body, hidden, created_at) VALUES (?, ?, ?, ?, datetime('now', ?))");
		COMMENTS.forEach(([title, user, body, hidden], i) => insComment.run(gameId[title], userId[user], body, hidden ? 1 : 0, `-${COMMENTS.length - i} hours`));
		db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(
			userId.troll99,
			'Tu comentario en "Hollow Knight" fue ocultado por moderación: "Juego sobrevalorado, el que lo recomiende no sabe nada."'
		);

		const favs = [['ana', 'Hollow Knight'], ['ana', 'Hades'], ['ana', 'Stardew Valley'], ['luis_gg', 'Elden Ring']];
		const insFav = db.prepare('INSERT INTO favorites (user_id, game_id) VALUES (?, ?)');
		for (const [u, g] of favs) insFav.run(userId[u], gameId[g]);

		db.exec('COMMIT');
	} catch (e) {
		db.exec('ROLLBACK');
		throw e;
	}
}

// Ejecución directa: borra la BD existente y la vuelve a crear
if (import.meta.url === `file:///${process.argv[1].replaceAll('\\', '/')}` || process.argv[1]?.endsWith('seed.js')) {
	// Se vacían las tablas en lugar de borrar el archivo (en Windows puede estar abierto por el servidor)
	const db = openDb(DB_FILE);
	db.exec('PRAGMA foreign_keys = OFF');
	for (const { name } of db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%'").all()) {
		db.exec(`DROP TABLE IF EXISTS "${name}"`);
	}
	db.exec(SCHEMA);
	seed(db);
	const n = (t) => db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n;
	console.log(`Base de datos creada en ${DB_FILE}`);
	console.log(`  ${n('users')} usuarios · ${n('games')} juegos · ${n('reviews')} reseñas · ${n('ratings')} calificaciones · ${n('comments')} comentarios`);
	db.close();
}
