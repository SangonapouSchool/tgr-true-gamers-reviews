/**
 * Pruebas unitarias de las reglas puras (sin base de datos).
 * Los identificadores PU-xx corresponden al plan de pruebas (proyecto_plan_ejecución_pruebas.pdf).
 */
import { describe, it, expect } from 'vitest';
import { normalizeScore, communityScore, average, isValidStars, MIN_COMMUNITY_RATINGS } from '../src/lib/scoring.js';
import { renderMarkdown, linesToList, escapeHtml } from '../src/lib/markdown.js';
import { can } from '../src/lib/permissions.js';
import { validatePassword, validateEmail, validateUsername, validateYear, slugify } from '../src/lib/validation.js';
import { hashPassword, verifyPassword } from '../src/lib/server/auth.js';

describe('RN1 · conversión de escalas a 5 estrellas', () => {
	it('PU-01 convierte /10 y /100 a /5 con un decimal', () => {
		expect(normalizeScore(8.5, 10)).toBe(4.3);
		expect(normalizeScore(92, 100)).toBe(4.6);
		expect(normalizeScore(4, 5)).toBe(4);
		expect(normalizeScore(10, 10)).toBe(5);
		expect(normalizeScore(0, 100)).toBe(0);
	});
	it('PU-02 rechaza calificaciones fuera de la escala', () => {
		expect(() => normalizeScore(11, 10)).toThrow();
		expect(() => normalizeScore(-1, 5)).toThrow();
		expect(() => normalizeScore(3, 0)).toThrow();
		expect(() => normalizeScore('abc', 10)).toThrow();
	});
});

describe('RN3 · promedio de la comunidad', () => {
	it('PU-03 no muestra promedio con menos de 5 calificaciones', () => {
		const r = communityScore([5, 5, 4, 4]);
		expect(MIN_COMMUNITY_RATINGS).toBe(5);
		expect(r).toEqual({ value: null, count: 4, sufficient: false });
	});
	it('PU-04 muestra el promedio a partir de 5 calificaciones', () => {
		expect(communityScore([5, 4, 4, 5, 3])).toEqual({ value: 4.2, count: 5, sufficient: true });
	});
	it('PU-05 promedio simple y estrellas válidas', () => {
		expect(average([])).toBeNull();
		expect(average([1, 2])).toBe(1.5);
		expect([1, 5].every(isValidStars)).toBe(true);
		expect([0, 6, 3.5, '4'].some(isValidStars)).toBe(false);
	});
});

describe('Formato de reseñas (RF5) y seguridad', () => {
	it('PU-06 convierte títulos, negritas, cursivas y listas', () => {
		const html = renderMarkdown('## Título\nTexto **fuerte** y *suave*.\n\n- uno\n- dos');
		expect(html).toContain('<h2>Título</h2>');
		expect(html).toContain('<strong>fuerte</strong>');
		expect(html).toContain('<em>suave</em>');
		expect(html).toContain('<ul><li>uno</li><li>dos</li></ul>');
	});
	it('PU-07 escapa HTML para evitar inyección de scripts (XSS)', () => {
		const html = renderMarkdown('<script>alert(1)</script> <img src=x onerror=alert(1)>');
		expect(html).not.toContain('<script>');
		expect(html).not.toContain('<img');
		expect(html).toContain('&lt;script&gt;');
		expect(escapeHtml(`"'&`)).toBe('&quot;&#39;&amp;');
	});
	it('PU-08 separa pros/contras por línea', () => {
		expect(linesToList('- Uno\n\n• Dos\n Tres ')).toEqual(['Uno', 'Dos', 'Tres']);
	});
});

describe('Permisos por rol', () => {
	const visitor = null;
	const user = { role: 'user', status: 'active' };
	const suspended = { role: 'user', status: 'suspended' };
	const tgrEditor = { role: 'editor', status: 'active', outlet: null };
	const outletEditor = { role: 'editor', status: 'active', outlet: 'PixelPress' };
	const admin = { role: 'admin', status: 'active' };

	it('PU-09 el visitante sólo puede leer', () => {
		for (const a of ['rate', 'comment', 'favorite', 'write_review', 'manage_games']) expect(can(visitor, a)).toBe(false);
	});
	it('PU-10 RN7: el usuario suspendido no califica, comenta ni usa favoritos', () => {
		expect(can(user, 'rate') && can(user, 'comment') && can(user, 'favorite')).toBe(true);
		expect(can(suspended, 'rate') || can(suspended, 'comment') || can(suspended, 'favorite')).toBe(false);
	});
	it('PU-11 sólo editores y administradores publican reseñas; la oficial sólo staff TGR/admin', () => {
		expect(can(user, 'write_review')).toBe(false);
		expect(can(outletEditor, 'write_review')).toBe(true);
		expect(can(outletEditor, 'write_official')).toBe(false);
		expect(can(tgrEditor, 'write_official')).toBe(true);
		expect(can(admin, 'write_official')).toBe(true);
	});
	it('PU-12 sólo el administrador gestiona juegos, usuarios y comentarios', () => {
		for (const a of ['manage_games', 'manage_users', 'moderate']) {
			expect(can(admin, a)).toBe(true);
			expect(can(tgrEditor, a)).toBe(false);
			expect(can(user, a)).toBe(false);
		}
	});
});

describe('Validaciones y contraseñas (RNF5)', () => {
	it('PU-13 la contraseña requiere mínimo 8 caracteres', () => {
		expect(validatePassword('1234567')).toBeTruthy();
		expect(validatePassword('12345678')).toBeNull();
	});
	it('PU-14 las contraseñas se almacenan cifradas con sal y se verifican', () => {
		const h1 = hashPassword('secreto123');
		const h2 = hashPassword('secreto123');
		expect(h1).not.toContain('secreto123');
		expect(h1).not.toBe(h2); // sal distinta
		expect(verifyPassword('secreto123', h1)).toBe(true);
		expect(verifyPassword('otra', h1)).toBe(false);
		expect(verifyPassword('x', 'basura')).toBe(false);
	});
	it('PU-15 valida correo, usuario, año y genera slugs', () => {
		expect(validateEmail('a@b.mx')).toBeNull();
		expect(validateEmail('no-correo')).toBeTruthy();
		expect(validateUsername('ab')).toBeTruthy();
		expect(validateUsername('gamer_01')).toBeNull();
		expect(validateYear(1969)).toBeTruthy();
		expect(validateYear(2024)).toBeNull();
		expect(slugify("Baldur's Gate 3")).toBe('baldur-s-gate-3');
		expect(slugify('Pokémon Rojo')).toBe('pokemon-rojo');
	});
});
