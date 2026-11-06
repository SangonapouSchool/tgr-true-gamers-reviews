/**
 * Reglas de calificación de TGR.
 * RN1: todas las calificaciones se muestran en escala de 1 a 5 estrellas.
 * RN3: el promedio de la comunidad sólo se muestra con al menos 5 calificaciones.
 * RN5: la calificación de revistas es el promedio de todas las reseñas de revistas.
 */

/** Número mínimo de calificaciones para mostrar el promedio de la comunidad (RN3). */
export const MIN_COMMUNITY_RATINGS = 5;

/** Redondea a un decimal. */
export const round1 = (n) => Math.round(n * 10) / 10;

/**
 * Convierte una calificación de cualquier escala a la escala de 5 estrellas (RN1).
 * Ej.: 8.5/10 → 4.3 ; 92/100 → 4.6 ; 4/5 → 4
 * @param {number} raw  calificación original
 * @param {number} max  máximo de la escala original (5, 10, 100…)
 * @returns {number} valor entre 0 y 5 con un decimal
 */
export function normalizeScore(raw, max) {
	const r = Number(raw);
	const m = Number(max);
	if (!Number.isFinite(r) || !Number.isFinite(m) || m <= 0) {
		throw new Error('Escala inválida');
	}
	if (r < 0 || r > m) throw new Error('La calificación debe estar entre 0 y el máximo de la escala');
	return round1((r / m) * 5);
}

/**
 * Promedio simple redondeado a un decimal; null si no hay valores.
 * @param {number[]} values
 */
export function average(values) {
	if (!values.length) return null;
	return round1(values.reduce((a, b) => a + b, 0) / values.length);
}

/**
 * Promedio de la comunidad respetando RN3.
 * @param {number[]} stars calificaciones 1–5 de los usuarios
 * @returns {{ value: number|null, count: number, sufficient: boolean }}
 */
export function communityScore(stars) {
	const count = stars.length;
	const sufficient = count >= MIN_COMMUNITY_RATINGS;
	return { value: sufficient ? average(stars) : null, count, sufficient };
}

/** Valida una calificación de usuario (1 a 5 estrellas enteras, RF7). */
export function isValidStars(n) {
	return Number.isInteger(n) && n >= 1 && n <= 5;
}
