/**
 * Pruebas de integración: repositorio + SQLite en memoria con los datos de demostración.
 * Los identificadores PI-xx corresponden al plan de pruebas.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import * as repo from '../src/lib/server/repo.js';
import { createSession, getSessionUser, deleteSession } from '../src/lib/server/auth.js';
import { freshDb, userByName, gameByTitle } from './helpers.js';

let db;
beforeEach(() => {
	db = freshDb();
});

const reviewData = (over = {}) => ({
	title: 'Reseña de prueba',
	body: 'Un texto de reseña suficientemente largo para pasar la validación.',
	pros: 'Bueno',
	cons: 'Malo',
	verdict: 'Recomendado',
	score_raw: 8,
	score_max: 10,
	...over
});

describe('Registro e inicio de sesión (RF3, RF4, RNF5)', () => {
	it('PI-01 registra un usuario nuevo con rol "user" y puede autenticarse', () => {
		const u = repo.registerUser(db, { username: 'nuevo_1', email: 'Nuevo@Mail.com', password: 'segura123' });
		expect(u).toMatchObject({ username: 'nuevo_1', email: 'nuevo@mail.com', role: 'user', status: 'active' });
		expect(repo.authenticate(db, 'nuevo@mail.com', 'segura123')?.id).toBe(u.id);
		expect(repo.authenticate(db, 'nuevo_1', 'segura123')?.id).toBe(u.id);
		expect(repo.authenticate(db, 'nuevo_1', 'incorrecta')).toBeNull();
	});
	it('PI-02 rechaza contraseña corta y correo/usuario duplicado', () => {
		expect(() => repo.registerUser(db, { username: 'x_user', email: 'x@x.com', password: '123' })).toThrow(/8 caracteres/);
		expect(() => repo.registerUser(db, { username: 'otro', email: 'ana@tgr.test', password: 'segura123' })).toThrow(/ya está registrado/);
	});
	it('PI-03 las sesiones identifican al usuario y se invalidan al cerrar sesión', () => {
		const ana = userByName(db, 'ana');
		const s = createSession(db, ana.id);
		expect(getSessionUser(db, s.id)?.username).toBe('ana');
		deleteSession(db, s.id);
		expect(getSessionUser(db, s.id)).toBeNull();
		expect(getSessionUser(db, 'token-falso')).toBeNull();
	});
});

describe('Búsqueda y catálogo (RF1, RF2)', () => {
	it('PI-04 busca por título (parcial, sin distinguir mayúsculas)', () => {
		const r = repo.searchGames(db, { q: 'hollow' });
		expect(r.map((g) => g.title)).toEqual(['Hollow Knight']);
	});
	it('PI-05 filtra por consola, género y año, y combina filtros', () => {
		expect(repo.searchGames(db, { platform: 'SNES' }).map((g) => g.title).sort()).toEqual(['Chrono Trigger', 'Super Mario World']);
		expect(repo.searchGames(db, { genre: 'Roguelike' }).length).toBe(2);
		expect(repo.searchGames(db, { year: 2023 }).length).toBe(4);
		expect(repo.searchGames(db, { platform: 'Switch', genre: 'Plataformas' }).map((g) => g.title)).toEqual(['Celeste']);
		expect(repo.searchGames(db, { q: 'no-existe-xyz' })).toEqual([]);
	});
	it('PI-06 el catálogo expone las facetas de filtro', () => {
		const f = repo.getFacets(db);
		expect(f.platforms).toContain('PS5');
		expect(f.genres).toContain('RPG');
		expect(f.years[0]).toBe(2024);
	});
});

describe('Tres calificaciones independientes (RF6, RN1, RN3, RN5)', () => {
	it('PI-07 Hollow Knight muestra TGR, promedio de revistas convertido y comunidad', () => {
		const g = repo.getGameBySlug(db, 'hollow-knight');
		expect(g.scores.tgr).toBe(4.8);
		// PixelPress 9.5/10 = 4.75 (4.8) · Modo Retro 94/100 = 4.7 · Control Total 4.5/5 = 4.5 → 4.7
		expect(g.scores.press).toBe(4.7);
		expect(g.scores.pressCount).toBe(3);
		expect(g.scores.communitySufficient).toBe(true);
		expect(g.scores.community).toBe(4.7);
	});
	it('PI-08 con menos de 5 votos no hay promedio de comunidad', () => {
		const g = repo.getGameBySlug(db, 'chrono-trigger');
		expect(g.scores.communityCount).toBe(3);
		expect(g.scores.community).toBeNull();
		expect(g.scores.communitySufficient).toBe(false);
	});
	it('PI-09 el desglose por revista conserva la calificación original y la convertida', () => {
		const { outlets } = repo.getReviewsForGame(db, gameByTitle(db, 'Hollow Knight').id);
		const mr = outlets.find((o) => o.outlet === 'Modo Retro');
		expect([mr.score_raw, mr.score_max, mr.score]).toEqual([94, 100, 4.7]);
	});
});

describe('Calificar, comentar y favoritos (RF7, RF8, RF9, RN2, RN7)', () => {
	it('PI-10 RN2: recalificar reemplaza la calificación anterior', () => {
		const ana = userByName(db, 'ana');
		const g = gameByTitle(db, 'Balatro');
		repo.rateGame(db, ana, g.id, 2);
		const before = repo.getGameById(db, g.id).scores.communityCount;
		repo.rateGame(db, ana, g.id, 5);
		expect(repo.getUserRating(db, ana.id, g.id)).toBe(5);
		expect(repo.getGameById(db, g.id).scores.communityCount).toBe(before);
	});
	it('PI-11 al llegar a 5 votos aparece el promedio de la comunidad', () => {
		const g = gameByTitle(db, 'Chrono Trigger'); // tiene 3 votos
		repo.rateGame(db, userByName(db, 'kevin8bit'), g.id, 4);
		expect(repo.getGameById(db, g.id).scores.community).toBeNull();
		repo.rateGame(db, userByName(db, 'dani_speedrun'), g.id, 5);
		expect(repo.getGameById(db, g.id).scores.community).toBe(4.6); // (5+5+4+4+5)/5
	});
	it('PI-12 rechaza calificaciones fuera de 1–5 y visitantes sin sesión', () => {
		const g = gameByTitle(db, 'Celeste');
		expect(() => repo.rateGame(db, userByName(db, 'ana'), g.id, 6)).toThrow(/1 a 5/);
		expect(() => repo.rateGame(db, null, g.id, 4)).toThrow(/iniciar sesión/);
	});
	it('PI-13 publica comentarios y valida longitud', () => {
		const g = gameByTitle(db, 'Celeste');
		const ana = userByName(db, 'ana');
		repo.addComment(db, ana, g.id, '¡Gran juego!');
		expect(repo.listComments(db, g.id)[0]).toMatchObject({ body: '¡Gran juego!', username: 'ana' });
		expect(() => repo.addComment(db, ana, g.id, ' ')).toThrow(/vacío/);
		expect(() => repo.addComment(db, ana, g.id, 'x'.repeat(1001))).toThrow(/1000/);
	});
	it('PI-14 agrega y quita favoritos', () => {
		const luis = userByName(db, 'luis_gg');
		const g = gameByTitle(db, 'Hades');
		expect(repo.toggleFavorite(db, luis, g.id)).toBe(true);
		expect(repo.listFavorites(db, luis.id).map((x) => x.title)).toContain('Hades');
		expect(repo.toggleFavorite(db, luis, g.id)).toBe(false);
		expect(repo.isFavorite(db, luis.id, g.id)).toBe(false);
	});
	it('PI-15 RN7: un usuario suspendido no puede calificar, comentar ni usar favoritos', () => {
		const troll = userByName(db, 'troll99');
		const g = gameByTitle(db, 'Hades');
		expect(() => repo.rateGame(db, troll, g.id, 1)).toThrow(/suspendida/);
		expect(() => repo.addComment(db, troll, g.id, 'spam')).toThrow(/suspendida/);
		expect(() => repo.toggleFavorite(db, troll, g.id)).toThrow(/suspendida/);
		// pero sí puede leer
		expect(repo.getGameBySlug(db, 'hades')).toBeTruthy();
	});
});

describe('Reseñas (RF5, RN4, RN6)', () => {
	it('PI-16 el editor de TGR publica la reseña oficial de un juego sin reseña', () => {
		const sofia = userByName(db, 'sofia_tgr');
		const g = gameByTitle(db, 'Street Fighter 6');
		const r = repo.createReview(db, sofia, g.id, reviewData());
		expect(r).toMatchObject({ kind: 'official', outlet: null, score: 4 });
		expect(repo.getGameById(db, g.id).scores.tgr).toBe(4);
	});
	it('PI-17 RN6: no se permite una segunda reseña oficial', () => {
		const g = gameByTitle(db, 'Hollow Knight');
		expect(() => repo.createReview(db, userByName(db, 'admin'), g.id, reviewData())).toThrow(/ya tiene una reseña oficial/);
	});
	it('PI-18 RN4: el editor de revista publica como su revista y una sola vez por juego', () => {
		const pp = userByName(db, 'pixelpress');
		const g = gameByTitle(db, 'Street Fighter 6');
		const r = repo.createReview(db, pp, g.id, reviewData({ score_raw: 9 }));
		expect(r).toMatchObject({ kind: 'outlet', outlet: 'PixelPress', score: 4.5 });
		expect(() => repo.createReview(db, pp, g.id, reviewData())).toThrow(/ya publicó/);
	});
	it('PI-19 un usuario registrado no puede publicar reseñas', () => {
		expect(() => repo.createReview(db, userByName(db, 'ana'), 1, reviewData())).toThrow(/permiso/);
	});
	it('PI-20 RNF4: una imagen sin texto alternativo se rechaza', () => {
		const g = gameByTitle(db, 'Street Fighter 6');
		expect(() => repo.createReview(db, userByName(db, 'sofia_tgr'), g.id, reviewData({ image: '/uploads/a.png' }))).toThrow(/texto alternativo/);
	});
	it('PI-21 editar y eliminar respeta la propiedad de la reseña', () => {
		const hk = gameByTitle(db, 'Hollow Knight');
		const { official, outlets } = repo.getReviewsForGame(db, hk.id);
		const modo = outlets.find((o) => o.outlet === 'Modo Retro');
		const pp = userByName(db, 'pixelpress');
		expect(() => repo.updateReview(db, pp, modo.id, reviewData())).toThrow(/permiso/);
		expect(() => repo.updateReview(db, pp, official.id, reviewData())).toThrow(/permiso/);
		const upd = repo.updateReview(db, userByName(db, 'sofia_tgr'), official.id, reviewData({ score_raw: 3, score_max: 5 }));
		expect(upd.score).toBe(3);
		repo.deleteReview(db, userByName(db, 'admin'), official.id);
		expect(repo.getGameById(db, hk.id).scores.tgr).toBeNull();
	});
});

describe('Administración (RF10, RF11, RF12, RN8)', () => {
	it('PI-22 el administrador agrega, edita y elimina videojuegos', () => {
		const admin = userByName(db, 'admin');
		const g = repo.createGame(db, admin, { title: 'Juego Nuevo', genre: 'Puzzle', year: 2025, platforms: ['PC', 'Switch, PS5'] });
		expect(g).toMatchObject({ slug: 'juego-nuevo', platforms: ['PC', 'PS5', 'Switch'] });
		const e = repo.updateGame(db, admin, g.id, { title: 'Juego Editado', genre: 'Acción', year: 2024, platforms: 'PC' });
		expect(e).toMatchObject({ title: 'Juego Editado', slug: 'juego-editado', genre: 'Acción', year: 2024, platforms: ['PC'] });
		repo.deleteGame(db, admin, g.id);
		expect(repo.getGameById(db, g.id)).toBeNull();
	});
	it('PI-23 valida los campos obligatorios del videojuego y bloquea a no administradores', () => {
		const admin = userByName(db, 'admin');
		expect(() => repo.createGame(db, admin, { title: '', genre: 'x', year: 2020, platforms: 'PC' })).toThrow(/título/);
		expect(() => repo.createGame(db, admin, { title: 'A', genre: 'x', year: 2020, platforms: '' })).toThrow(/consola/);
		expect(() => repo.createGame(db, admin, { title: 'A', genre: 'x', year: 1900, platforms: 'PC' })).toThrow(/Año/);
		expect(() => repo.createGame(db, userByName(db, 'sofia_tgr'), { title: 'A', genre: 'x', year: 2020, platforms: 'PC' })).toThrow(/permiso/);
	});
	it('PI-24 el administrador cambia roles y suspende cuentas (con notificación)', () => {
		const admin = userByName(db, 'admin');
		const ana = userByName(db, 'ana');
		expect(repo.updateUserByAdmin(db, admin, ana.id, { role: 'editor', outlet: 'Revista X' })).toMatchObject({ role: 'editor', outlet: 'Revista X' });
		expect(repo.updateUserByAdmin(db, admin, ana.id, { role: 'user' }).outlet).toBeNull();
		repo.updateUserByAdmin(db, admin, ana.id, { status: 'suspended' });
		expect(repo.listNotifications(db, ana.id)[0].message).toMatch(/suspendida/);
		expect(() => repo.updateUserByAdmin(db, admin, admin.id, { role: 'user' })).toThrow(/propia cuenta/);
		expect(() => repo.updateUserByAdmin(db, ana, admin.id, { role: 'user' })).toThrow();
	});
	it('PI-25 RN8: ocultar un comentario lo quita del sitio y notifica al autor', () => {
		const admin = userByName(db, 'admin');
		const g = gameByTitle(db, 'Hades');
		const [c] = repo.listComments(db, g.id);
		const author = userByName(db, c.username);
		const before = repo.unreadCount(db, author.id);
		repo.moderateComment(db, admin, c.id, 'hide');
		expect(repo.listComments(db, g.id).some((x) => x.id === c.id)).toBe(false);
		expect(repo.unreadCount(db, author.id)).toBe(before + 1);
		repo.moderateComment(db, admin, c.id, 'unhide');
		expect(repo.listComments(db, g.id).some((x) => x.id === c.id)).toBe(true);
		repo.moderateComment(db, admin, c.id, 'delete');
		expect(repo.listAllComments(db).some((x) => x.id === c.id)).toBe(false);
	});
	it('PI-26 un usuario normal no puede moderar', () => {
		expect(() => repo.moderateComment(db, userByName(db, 'ana'), 1, 'hide')).toThrow(/permiso/);
	});
});

describe('Rendimiento (RNF2)', () => {
	it('PI-27 la búsqueda y la carga de una reseña tardan mucho menos de 3 s', () => {
		const admin = userByName(db, 'admin');
		for (let i = 0; i < 500; i++) repo.createGame(db, admin, { title: `Juego carga ${i}`, genre: 'Prueba', year: 2020, platforms: 'PC' });
		const t0 = performance.now();
		repo.searchGames(db, { q: 'carga', limit: 200 });
		repo.getGameBySlug(db, 'hollow-knight');
		repo.getReviewsForGame(db, 1);
		repo.listComments(db, 1);
		expect(performance.now() - t0).toBeLessThan(3000);
	});
});
