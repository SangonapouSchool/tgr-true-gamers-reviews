/** Validaciones compartidas entre formularios y pruebas. */

export const MIN_PASSWORD = 8; // RNF5

export function validatePassword(pw) {
	if (typeof pw !== 'string' || pw.length < MIN_PASSWORD) {
		return `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`;
	}
	return null;
}

export function validateEmail(email) {
	return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? null : 'Correo electrónico inválido.';
}

export function validateUsername(u) {
	return typeof u === 'string' && /^[a-zA-Z0-9_]{3,20}$/.test(u)
		? null
		: 'El usuario debe tener de 3 a 20 caracteres (letras, números o guion bajo).';
}

export function validateYear(y) {
	const n = Number(y);
	return Number.isInteger(n) && n >= 1970 && n <= new Date().getFullYear() + 2 ? null : 'Año de lanzamiento inválido.';
}

/** "The Legend of Zelda: Breath of the Wild" → "the-legend-of-zelda-breath-of-the-wild" */
export function slugify(s) {
	return String(s)
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
}
