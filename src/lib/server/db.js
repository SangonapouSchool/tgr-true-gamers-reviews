/**
 * Capa de datos: SQLite usando el módulo nativo `node:sqlite` (sin dependencias nativas).
 * El archivo de base de datos se toma de TGR_DB o, por defecto, data/tgr.db.
 */
import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

export const SCHEMA = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	username      TEXT NOT NULL UNIQUE COLLATE NOCASE,
	email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
	password_hash TEXT NOT NULL,
	role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','editor','admin')),
	status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
	outlet        TEXT,                       -- revista afiliada (RN4); NULL = staff de TGR
	created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
	id         TEXT PRIMARY KEY,
	user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	expires_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS games (
	id          INTEGER PRIMARY KEY AUTOINCREMENT,
	title       TEXT NOT NULL,
	slug        TEXT NOT NULL UNIQUE,
	genre       TEXT NOT NULL,
	year        INTEGER NOT NULL,
	developer   TEXT,
	synopsis    TEXT,
	cover_hue   INTEGER NOT NULL DEFAULT 260,  -- portada generada (sin arte con derechos)
	created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS game_platforms (
	game_id  INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
	platform TEXT NOT NULL,
	PRIMARY KEY (game_id, platform)
);

CREATE TABLE IF NOT EXISTS reviews (
	id           INTEGER PRIMARY KEY AUTOINCREMENT,
	game_id      INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
	author_id    INTEGER REFERENCES users(id) ON DELETE SET NULL,
	kind         TEXT NOT NULL CHECK (kind IN ('official','outlet')),
	outlet       TEXT,                         -- nombre de la revista cuando kind = 'outlet'
	title        TEXT NOT NULL,
	body         TEXT NOT NULL,
	pros         TEXT NOT NULL DEFAULT '',
	cons         TEXT NOT NULL DEFAULT '',
	verdict      TEXT NOT NULL DEFAULT '',
	score_raw    REAL NOT NULL,
	score_max    REAL NOT NULL DEFAULT 5,
	score        REAL NOT NULL,                -- normalizada a 5 estrellas (RN1)
	image        TEXT,
	image_alt    TEXT,
	published_at TEXT NOT NULL DEFAULT (datetime('now')),
	updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
-- RN6: cada videojuego sólo puede tener una reseña oficial de TGR
CREATE UNIQUE INDEX IF NOT EXISTS one_official_per_game ON reviews(game_id) WHERE kind = 'official';
-- Una revista publica a lo más una reseña por juego
CREATE UNIQUE INDEX IF NOT EXISTS one_outlet_review_per_game ON reviews(game_id, outlet) WHERE kind = 'outlet';

CREATE TABLE IF NOT EXISTS ratings (
	user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	game_id    INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
	stars      INTEGER NOT NULL CHECK (stars BETWEEN 1 AND 5),
	updated_at TEXT NOT NULL DEFAULT (datetime('now')),
	PRIMARY KEY (user_id, game_id)            -- RN2: una calificación por usuario y juego
);

CREATE TABLE IF NOT EXISTS comments (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	game_id    INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
	user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	body       TEXT NOT NULL,
	hidden     INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS favorites (
	user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	game_id    INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	PRIMARY KEY (user_id, game_id)
);

CREATE TABLE IF NOT EXISTS notifications (
	id         INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
	message    TEXT NOT NULL,
	read       INTEGER NOT NULL DEFAULT 0,
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_games_title ON games(title);
CREATE INDEX IF NOT EXISTS idx_comments_game ON comments(game_id);
CREATE INDEX IF NOT EXISTS idx_reviews_game ON reviews(game_id);
`;

/**
 * Abre (o crea) una base de datos y aplica el esquema.
 * @param {string} file ruta del archivo o ':memory:' para pruebas
 */
export function openDb(file) {
	if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
	const db = new DatabaseSync(file);
	db.exec(SCHEMA);
	return db;
}

export const DB_FILE = process.env.TGR_DB ?? path.resolve('data', 'tgr.db');

/** @type {DatabaseSync | undefined} */
let instance;

/** Conexión compartida de la aplicación. */
export function getDb() {
	instance ??= openDb(DB_FILE);
	return instance;
}

/** Ejecuta fn dentro de una transacción. */
export function tx(db, fn) {
	db.exec('BEGIN');
	try {
		const r = fn();
		db.exec('COMMIT');
		return r;
	} catch (e) {
		db.exec('ROLLBACK');
		throw e;
	}
}
