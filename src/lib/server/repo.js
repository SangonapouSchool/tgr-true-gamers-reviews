/**
 * Repositorio: todas las operaciones de datos y las reglas de negocio del SRS.
 * Cada función recibe la conexión `db` como primer argumento para poder probarse
 * con una base de datos en memoria.
 */
import { tx } from './db.js';
import { hashPassword, verifyPassword } from './auth.js';
import { can, ROLES } from '../permissions.js';
import { communityScore, isValidStars, normalizeScore, round1 } from '../scoring.js';
import { slugify, validateEmail, validatePassword, validateUsername, validateYear } from '../validation.js';

/** Error de regla de negocio o validación: se muestra al usuario tal cual. */
export class RuleError extends Error {
	constructor(message, status = 400) {
		super(message);
		this.status = status;
	}
}

function assert(cond, message, status = 400) {
	if (!cond) throw new RuleError(message, status);
}

function requirePerm(user, action, ctx) {
	if (!user) throw new RuleError('Debes iniciar sesión para hacer esto.', 401);
	if (user.status === 'suspended' && ['rate', 'comment', 'favorite'].includes(action)) {
		throw new RuleError('Tu cuenta está suspendida: puedes leer reseñas pero no participar.', 403);
	}
	assert(can(user, action, ctx), 'No tienes permiso para realizar esta acción.', 403);
}

/* ------------------------------------------------------------------ */
/* Usuarios                                                            */
/* ------------------------------------------------------------------ */

/** RF3 — registro de visitantes. */
export function registerUser(db, { username, email, password }) {
	username = String(username ?? '').trim();
	email = String(email ?? '').trim().toLowerCase();
	const err = validateUsername(username) ?? validateEmail(email) ?? validatePassword(password);
	assert(!err, err);
	const exists = db.prepare('SELECT 1 FROM users WHERE username = ? OR email = ?').get(username, email);
	assert(!exists, 'Ese usuario o correo ya está registrado.');
	const r = db
		.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)')
		.run(username, email, hashPassword(password));
	return getUser(db, Number(r.lastInsertRowid));
}

/** RF4 — inicio de sesión con correo o nombre de usuario. */
export function authenticate(db, login, password) {
	const row = db
		.prepare('SELECT * FROM users WHERE email = ? OR username = ?')
		.get(String(login ?? '').trim().toLowerCase(), String(login ?? '').trim());
	if (!row || !verifyPassword(String(password ?? ''), row.password_hash)) return null;
	return getUser(db, row.id);
}

export function getUser(db, id) {
	const u = db.prepare('SELECT id, username, email, role, status, outlet, created_at FROM users WHERE id = ?').get(id);
	return u ? { ...u } : null;
}

export function listUsers(db, { q = '', role = '' } = {}) {
	return db
		.prepare(
			`SELECT u.id, u.username, u.email, u.role, u.status, u.outlet, u.created_at,
				(SELECT COUNT(*) FROM comments c WHERE c.user_id = u.id) AS comments
			 FROM users u
			 WHERE (? = '' OR u.username LIKE ? OR u.email LIKE ?) AND (? = '' OR u.role = ?)
			 ORDER BY u.created_at DESC, u.id DESC`
		)
		.all(q, `%${q}%`, `%${q}%`, role, role)
		.map((r) => ({ ...r }));
}

/** RF11 — el administrador cambia rol, estado o revista de un usuario. */
export function updateUserByAdmin(db, actor, id, { role, status, outlet }) {
	requirePerm(actor, 'manage_users');
	const target = getUser(db, id);
	assert(target, 'Usuario no encontrado.', 404);
	assert(target.id !== actor.id, 'No puedes modificar tu propia cuenta desde aquí.');
	if (role !== undefined) assert(ROLES.includes(role), 'Rol inválido.');
	if (status !== undefined) assert(['active', 'suspended'].includes(status), 'Estado inválido.');
	const next = {
		role: role ?? target.role,
		status: status ?? target.status,
		outlet: outlet === undefined ? target.outlet : String(outlet).trim() || null
	};
	if (next.role !== 'editor') next.outlet = null;
	db.prepare('UPDATE users SET role = ?, status = ?, outlet = ? WHERE id = ?').run(
		next.role,
		next.status,
		next.outlet,
		id
	);
	if (next.status === 'suspended' && target.status !== 'suspended') {
		notify(db, id, 'Tu cuenta fue suspendida por un administrador. Aún puedes leer reseñas.');
	}
	return getUser(db, id);
}

/* ------------------------------------------------------------------ */
/* Videojuegos                                                         */
/* ------------------------------------------------------------------ */

const GAME_SELECT = `
	SELECT g.*,
		(SELECT group_concat(platform, ', ') FROM (SELECT platform FROM game_platforms WHERE game_id = g.id ORDER BY platform)) AS platforms,
		(SELECT score FROM reviews WHERE game_id = g.id AND kind = 'official') AS tgr_score,
		(SELECT AVG(score) FROM reviews WHERE game_id = g.id AND kind = 'outlet') AS press_avg,
		(SELECT COUNT(*) FROM reviews WHERE game_id = g.id AND kind = 'outlet') AS press_count,
		(SELECT AVG(stars) FROM ratings WHERE game_id = g.id) AS community_avg,
		(SELECT COUNT(*) FROM ratings WHERE game_id = g.id) AS community_count,
		(SELECT MAX(published_at) FROM reviews WHERE game_id = g.id) AS last_review_at
	FROM games g`;

/** Agrega las tres calificaciones listas para mostrarse (RF6, RN1, RN3, RN5). */
function decorateGame(row) {
	if (!row) return null;
	const community = communityScore(new Array(Number(row.community_count)).fill(0));
	return {
		...row,
		platforms: row.platforms ? row.platforms.split(', ') : [],
		scores: {
			tgr: row.tgr_score == null ? null : round1(row.tgr_score),
			press: row.press_avg == null ? null : round1(row.press_avg),
			pressCount: Number(row.press_count),
			community: community.sufficient ? round1(row.community_avg) : null,
			communityCount: Number(row.community_count),
			communitySufficient: community.sufficient
		}
	};
}

/** RF1 / RF2 — catálogo con búsqueda y filtros (título, consola, género, año). */
export function searchGames(db, { q = '', platform = '', genre = '', year = '', sort = 'recent', limit = 60 } = {}) {
	const where = [];
	const params = [];
	if (q) {
		where.push('(g.title LIKE ? OR g.developer LIKE ?)');
		params.push(`%${q}%`, `%${q}%`);
	}
	if (platform) {
		where.push('EXISTS (SELECT 1 FROM game_platforms p WHERE p.game_id = g.id AND p.platform = ?)');
		params.push(platform);
	}
	if (genre) {
		where.push('g.genre = ?');
		params.push(genre);
	}
	if (year) {
		where.push('g.year = ?');
		params.push(Number(year));
	}
	const order =
		{
			recent: 'last_review_at IS NULL, last_review_at DESC, g.id DESC',
			title: 'g.title COLLATE NOCASE ASC',
			year: 'g.year DESC, g.title',
			score: 'tgr_score IS NULL, tgr_score DESC, g.title'
		}[sort] ?? 'g.id DESC';
	const sql = `SELECT * FROM (${GAME_SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''}) g ORDER BY ${order} LIMIT ?`;
	return db
		.prepare(sql)
		.all(...params, limit)
		.map(decorateGame);
}

/** Valores disponibles para los filtros. */
export function getFacets(db) {
	return {
		platforms: db.prepare('SELECT DISTINCT platform FROM game_platforms ORDER BY platform').all().map((r) => r.platform),
		genres: db.prepare('SELECT DISTINCT genre FROM games ORDER BY genre').all().map((r) => r.genre),
		years: db.prepare('SELECT DISTINCT year FROM games ORDER BY year DESC').all().map((r) => r.year)
	};
}

export function getGameBySlug(db, slug) {
	return decorateGame(db.prepare(`${GAME_SELECT} WHERE g.slug = ?`).get(slug));
}

export function getGameById(db, id) {
	return decorateGame(db.prepare(`${GAME_SELECT} WHERE g.id = ?`).get(id));
}

function cleanGame(data) {
	const title = String(data.title ?? '').trim();
	const genre = String(data.genre ?? '').trim();
	const platforms = [
		...new Set(
			[]
				.concat(data.platforms ?? [])
				.flatMap((p) => String(p).split(','))
				.map((p) => p.trim())
				.filter(Boolean)
		)
	];
	assert(title.length >= 1 && title.length <= 120, 'El título es obligatorio (máx. 120 caracteres).');
	assert(genre, 'El género es obligatorio.');
	assert(platforms.length > 0, 'Indica al menos una consola o plataforma.');
	const yErr = validateYear(data.year);
	assert(!yErr, yErr);
	// undefined = conservar la portada actual · '' = quitarla · texto = nueva portada
	let cover_image;
	if (data.cover_image !== undefined) {
		cover_image = String(data.cover_image ?? '').trim() || null;
		assert(!cover_image || /^\/uploads\/[\w.-]+$|^https:\/\/\S+$/.test(cover_image), 'La portada debe ser una imagen subida o una dirección https.');
	}
	return {
		cover_image,
		title,
		genre,
		platforms,
		year: Number(data.year),
		developer: String(data.developer ?? '').trim() || null,
		synopsis: String(data.synopsis ?? '').trim() || null,
		cover_hue: Number.isFinite(Number(data.cover_hue)) && data.cover_hue !== '' ? Number(data.cover_hue) % 360 : hueFor(title)
	};
}

/** Tono de color estable derivado del título, para la portada generada. */
export function hueFor(title) {
	let h = 0;
	for (const ch of String(title)) h = (h * 31 + ch.codePointAt(0)) % 360;
	return h;
}

function uniqueSlug(db, title, exceptId = 0) {
	const base = slugify(title) || 'juego';
	let slug = base;
	for (let i = 2; db.prepare('SELECT 1 FROM games WHERE slug = ? AND id <> ?').get(slug, exceptId); i++) {
		slug = `${base}-${i}`;
	}
	return slug;
}

/** RF10 — alta de videojuego. */
export function createGame(db, actor, data) {
	requirePerm(actor, 'manage_games');
	const g = cleanGame(data);
	return tx(db, () => {
		const r = db
			.prepare('INSERT INTO games (title, slug, genre, year, developer, synopsis, cover_hue, cover_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
			.run(g.title, uniqueSlug(db, g.title), g.genre, g.year, g.developer, g.synopsis, g.cover_hue, g.cover_image ?? null);
		const id = Number(r.lastInsertRowid);
		const ins = db.prepare('INSERT INTO game_platforms (game_id, platform) VALUES (?, ?)');
		for (const p of g.platforms) ins.run(id, p);
		return getGameById(db, id);
	});
}

/** RF10 — edición de videojuego. */
export function updateGame(db, actor, id, data) {
	requirePerm(actor, 'manage_games');
	const current = getGameById(db, id);
	assert(current, 'Videojuego no encontrado.', 404);
	const g = cleanGame(data);
	return tx(db, () => {
		db.prepare('UPDATE games SET title = ?, slug = ?, genre = ?, year = ?, developer = ?, synopsis = ?, cover_hue = ?, cover_image = ? WHERE id = ?').run(
			g.title,
			uniqueSlug(db, g.title, id),
			g.genre,
			g.year,
			g.developer,
			g.synopsis,
			g.cover_hue,
			g.cover_image === undefined ? current.cover_image : g.cover_image,
			id
		);
		db.prepare('DELETE FROM game_platforms WHERE game_id = ?').run(id);
		const ins = db.prepare('INSERT INTO game_platforms (game_id, platform) VALUES (?, ?)');
		for (const p of g.platforms) ins.run(id, p);
		return getGameById(db, id);
	});
}

/** RF10 — baja de videojuego (borra en cascada reseñas, calificaciones, etc.). */
export function deleteGame(db, actor, id) {
	requirePerm(actor, 'manage_games');
	const r = db.prepare('DELETE FROM games WHERE id = ?').run(id);
	assert(r.changes === 1, 'Videojuego no encontrado.', 404);
}

/* ------------------------------------------------------------------ */
/* Reseñas                                                             */
/* ------------------------------------------------------------------ */

const REVIEW_SELECT = `
	SELECT r.*, u.username AS author, g.title AS game_title, g.slug AS game_slug
	FROM reviews r LEFT JOIN users u ON u.id = r.author_id JOIN games g ON g.id = r.game_id`;

export function getReviewsForGame(db, gameId) {
	const rows = db.prepare(`${REVIEW_SELECT} WHERE r.game_id = ? ORDER BY r.kind DESC, r.score DESC`).all(gameId).map((r) => ({ ...r }));
	return {
		official: rows.find((r) => r.kind === 'official') ?? null,
		outlets: rows.filter((r) => r.kind === 'outlet')
	};
}

export function getReview(db, id) {
	const r = db.prepare(`${REVIEW_SELECT} WHERE r.id = ?`).get(id);
	return r ? { ...r } : null;
}

/** Reseñas que un editor puede gestionar. */
export function listManageableReviews(db, user) {
	let rows;
	if (user.role === 'admin') rows = db.prepare(`${REVIEW_SELECT} ORDER BY r.updated_at DESC`).all();
	else if (user.outlet) rows = db.prepare(`${REVIEW_SELECT} WHERE r.kind = 'outlet' AND r.outlet = ? ORDER BY r.updated_at DESC`).all(user.outlet);
	else rows = db.prepare(`${REVIEW_SELECT} WHERE r.kind = 'official' ORDER BY r.updated_at DESC`).all();
	return rows.map((r) => ({ ...r }));
}

/** ¿Puede este usuario editar/eliminar esta reseña? */
export function canManageReview(user, review) {
	if (!can(user, 'write_review')) return false;
	if (user.role === 'admin') return true;
	if (review.kind === 'official') return !user.outlet;
	return review.outlet === user.outlet;
}

function cleanReview(data) {
	const title = String(data.title ?? '').trim();
	const body = String(data.body ?? '').trim();
	assert(title.length >= 3, 'El título de la reseña es obligatorio.');
	assert(body.length >= 20, 'El texto de la reseña debe tener al menos 20 caracteres.');
	const score_max = Number(data.score_max ?? 5);
	assert([5, 10, 100].includes(score_max), 'La escala debe ser 5, 10 o 100.');
	let score;
	try {
		score = normalizeScore(Number(data.score_raw), score_max);
	} catch (e) {
		throw new RuleError(e.message);
	}
	const image = String(data.image ?? '').trim() || null;
	const image_alt = String(data.image_alt ?? '').trim() || null;
	assert(!image || image_alt, 'Toda imagen debe tener texto alternativo (accesibilidad).'); // RNF4
	return {
		title,
		body,
		pros: String(data.pros ?? '').trim(),
		cons: String(data.cons ?? '').trim(),
		verdict: String(data.verdict ?? '').trim(),
		score_raw: Number(data.score_raw),
		score_max,
		score,
		image,
		image_alt
	};
}

/**
 * RF5 — crear una reseña. El tipo se decide por la cuenta:
 * editores de revista (RN4) publican reseñas de su revista; staff de TGR y admins la oficial.
 */
export function createReview(db, user, gameId, data) {
	requirePerm(user, 'write_review');
	assert(getGameById(db, gameId), 'Videojuego no encontrado.', 404);
	const r = cleanReview(data);
	const kind = user.outlet ? 'outlet' : 'official';
	if (kind === 'official') {
		// RN6
		const dup = db.prepare("SELECT 1 FROM reviews WHERE game_id = ? AND kind = 'official'").get(gameId);
		assert(!dup, 'Este videojuego ya tiene una reseña oficial de TGR. Edita la existente.');
	} else {
		const dup = db.prepare("SELECT 1 FROM reviews WHERE game_id = ? AND kind = 'outlet' AND outlet = ?").get(gameId, user.outlet);
		assert(!dup, `${user.outlet} ya publicó una reseña de este videojuego. Edita la existente.`);
	}
	const res = db
		.prepare(
			`INSERT INTO reviews (game_id, author_id, kind, outlet, title, body, pros, cons, verdict, score_raw, score_max, score, image, image_alt)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
		)
		.run(gameId, user.id, kind, kind === 'outlet' ? user.outlet : null, r.title, r.body, r.pros, r.cons, r.verdict, r.score_raw, r.score_max, r.score, r.image, r.image_alt);
	return getReview(db, Number(res.lastInsertRowid));
}

/** RF5 — editar una reseña. */
export function updateReview(db, user, id, data) {
	const existing = getReview(db, id);
	assert(existing, 'Reseña no encontrada.', 404);
	assert(canManageReview(user, existing), 'No tienes permiso para editar esta reseña.', 403);
	const r = cleanReview({ ...data, image: data.image ?? existing.image, image_alt: data.image_alt ?? existing.image_alt });
	db.prepare(
		`UPDATE reviews SET title = ?, body = ?, pros = ?, cons = ?, verdict = ?, score_raw = ?, score_max = ?, score = ?,
		 image = ?, image_alt = ?, updated_at = datetime('now') WHERE id = ?`
	).run(r.title, r.body, r.pros, r.cons, r.verdict, r.score_raw, r.score_max, r.score, r.image, r.image_alt, id);
	return getReview(db, id);
}

/** RF5 — eliminar una reseña. */
export function deleteReview(db, user, id) {
	const existing = getReview(db, id);
	assert(existing, 'Reseña no encontrada.', 404);
	assert(canManageReview(user, existing), 'No tienes permiso para eliminar esta reseña.', 403);
	db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
}

/* ------------------------------------------------------------------ */
/* Calificaciones, comentarios y favoritos                             */
/* ------------------------------------------------------------------ */

/** RF7 + RN2 — calificar (una vez por juego; recalificar reemplaza). */
export function rateGame(db, user, gameId, stars) {
	requirePerm(user, 'rate');
	stars = Number(stars);
	assert(isValidStars(stars), 'La calificación debe ser de 1 a 5 estrellas.');
	assert(getGameById(db, gameId), 'Videojuego no encontrado.', 404);
	db.prepare(
		`INSERT INTO ratings (user_id, game_id, stars) VALUES (?, ?, ?)
		 ON CONFLICT (user_id, game_id) DO UPDATE SET stars = excluded.stars, updated_at = datetime('now')`
	).run(user.id, gameId, stars);
	return stars;
}

export function getUserRating(db, userId, gameId) {
	return db.prepare('SELECT stars FROM ratings WHERE user_id = ? AND game_id = ?').get(userId, gameId)?.stars ?? null;
}

export function listUserRatings(db, userId) {
	return db
		.prepare('SELECT r.stars, r.updated_at, g.title, g.slug FROM ratings r JOIN games g ON g.id = r.game_id WHERE r.user_id = ? ORDER BY r.updated_at DESC')
		.all(userId)
		.map((r) => ({ ...r }));
}

/** RF8 — comentar en la reseña de un juego. */
export function addComment(db, user, gameId, body) {
	requirePerm(user, 'comment');
	body = String(body ?? '').trim();
	assert(body.length >= 2, 'El comentario está vacío.');
	assert(body.length <= 1000, 'El comentario no puede pasar de 1000 caracteres.');
	assert(getGameById(db, gameId), 'Videojuego no encontrado.', 404);
	const r = db.prepare('INSERT INTO comments (game_id, user_id, body) VALUES (?, ?, ?)').run(gameId, user.id, body);
	return Number(r.lastInsertRowid);
}

/** Comentarios visibles de un juego (los moderados se ocultan, RN8). */
export function listComments(db, gameId) {
	return db
		.prepare(
			`SELECT c.id, c.body, c.created_at, u.username, u.role, u.outlet
			 FROM comments c JOIN users u ON u.id = c.user_id
			 WHERE c.game_id = ? AND c.hidden = 0 ORDER BY c.created_at DESC, c.id DESC`
		)
		.all(gameId)
		.map((r) => ({ ...r }));
}

export function listAllComments(db, { filter = 'all' } = {}) {
	const cond = filter === 'hidden' ? 'WHERE c.hidden = 1' : filter === 'visible' ? 'WHERE c.hidden = 0' : '';
	return db
		.prepare(
			`SELECT c.id, c.body, c.hidden, c.created_at, u.username, g.title AS game_title, g.slug AS game_slug
			 FROM comments c JOIN users u ON u.id = c.user_id JOIN games g ON g.id = c.game_id
			 ${cond} ORDER BY c.created_at DESC, c.id DESC`
		)
		.all()
		.map((r) => ({ ...r }));
}

/** RF12 + RN8 — moderar comentario (ocultar, restaurar o eliminar) y notificar al autor. */
export function moderateComment(db, actor, commentId, action) {
	requirePerm(actor, 'moderate');
	const c = db
		.prepare('SELECT c.*, g.title FROM comments c JOIN games g ON g.id = c.game_id WHERE c.id = ?')
		.get(commentId);
	assert(c, 'Comentario no encontrado.', 404);
	const excerpt = c.body.length > 60 ? c.body.slice(0, 57) + '…' : c.body;
	if (action === 'hide') {
		db.prepare('UPDATE comments SET hidden = 1 WHERE id = ?').run(commentId);
		notify(db, c.user_id, `Tu comentario en "${c.title}" fue ocultado por moderación: "${excerpt}"`);
	} else if (action === 'unhide') {
		db.prepare('UPDATE comments SET hidden = 0 WHERE id = ?').run(commentId);
	} else if (action === 'delete') {
		db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
		notify(db, c.user_id, `Tu comentario en "${c.title}" fue eliminado por moderación: "${excerpt}"`);
	} else {
		throw new RuleError('Acción de moderación inválida.');
	}
}

/** RF9 — agregar o quitar de favoritos. Regresa el nuevo estado. */
export function toggleFavorite(db, user, gameId) {
	requirePerm(user, 'favorite');
	assert(getGameById(db, gameId), 'Videojuego no encontrado.', 404);
	const del = db.prepare('DELETE FROM favorites WHERE user_id = ? AND game_id = ?').run(user.id, gameId);
	if (del.changes) return false;
	db.prepare('INSERT INTO favorites (user_id, game_id) VALUES (?, ?)').run(user.id, gameId);
	return true;
}

export function isFavorite(db, userId, gameId) {
	return !!db.prepare('SELECT 1 FROM favorites WHERE user_id = ? AND game_id = ?').get(userId, gameId);
}

export function listFavorites(db, userId) {
	return db
		.prepare(`SELECT * FROM (${GAME_SELECT}) g WHERE g.id IN (SELECT game_id FROM favorites WHERE user_id = ?) ORDER BY g.title`)
		.all(userId)
		.map(decorateGame);
}

/* ------------------------------------------------------------------ */
/* Notificaciones y métricas                                           */
/* ------------------------------------------------------------------ */

export function notify(db, userId, message) {
	db.prepare('INSERT INTO notifications (user_id, message) VALUES (?, ?)').run(userId, message);
}

export function listNotifications(db, userId) {
	return db
		.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50')
		.all(userId)
		.map((r) => ({ ...r }));
}

export function unreadCount(db, userId) {
	return db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read = 0').get(userId).n;
}

export function markNotificationsRead(db, userId) {
	db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId);
}

export function getStats(db) {
	const n = (sql) => db.prepare(sql).get().n;
	return {
		games: n('SELECT COUNT(*) AS n FROM games'),
		reviews: n('SELECT COUNT(*) AS n FROM reviews'),
		users: n('SELECT COUNT(*) AS n FROM users'),
		ratings: n('SELECT COUNT(*) AS n FROM ratings'),
		comments: n('SELECT COUNT(*) AS n FROM comments'),
		hiddenComments: n('SELECT COUNT(*) AS n FROM comments WHERE hidden = 1'),
		suspended: n("SELECT COUNT(*) AS n FROM users WHERE status = 'suspended'"),
		gamesWithoutOfficial: n("SELECT COUNT(*) AS n FROM games g WHERE NOT EXISTS (SELECT 1 FROM reviews r WHERE r.game_id = g.id AND r.kind = 'official')")
	};
}
