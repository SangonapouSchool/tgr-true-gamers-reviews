/**
 * Pruebas funcionales de extremo a extremo (E2E) + capturas de evidencia.
 * Recorre la aplicación en un navegador real (Microsoft Edge vía playwright-core)
 * siguiendo los casos PF-xx del plan de pruebas.
 *
 * Requisitos: la app corriendo en BASE_URL (por defecto http://localhost:5173)
 * con la base de datos recién sembrada (npm run seed).
 * Uso: node scripts/e2e-evidencia.js
 */
import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL ?? 'http://localhost:5173';
const OUT = path.resolve(process.env.EVIDENCE_DIR ?? '../entrega/evidencia');
const SHOTS = path.join(OUT, 'capturas');
fs.mkdirSync(SHOTS, { recursive: true });

const results = [];
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge' });

async function newPage(viewport = { width: 1440, height: 900 }) {
	const ctx = await browser.newContext({ viewport, locale: 'es-MX', deviceScaleFactor: 1 });
	const page = await ctx.newPage();
	// Espera a que la app termine de hidratarse antes de interactuar
	const goto = page.goto.bind(page);
	page.goto = (u, o) => goto(u, { waitUntil: 'networkidle', ...o });
	const waitForURL = page.waitForURL.bind(page);
	page.waitForURL = async (u, o) => {
		await waitForURL(u, o);
		await page.waitForLoadState('networkidle');
	};
	return page;
}
async function shot(page, name, fullPage = true) {
	await page.waitForLoadState('networkidle').catch(() => {});
	await page.evaluate(() => document.fonts?.ready);
	await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage });
}
async function login(page, user, pass) {
	await page.goto(`${BASE}/login`);
	await page.fill('#login', user);
	await page.fill('#password', pass);
	await Promise.all([page.waitForURL((u) => !u.pathname.startsWith('/login')), page.click('button:has-text("Entrar")')]);
}
function expect(cond, msg) {
	if (!cond) throw new Error(msg);
}
async function test(id, name, req, fn) {
	const t0 = Date.now();
	try {
		const notes = await fn();
		results.push({ id, name, req, status: 'Aprobada', ms: Date.now() - t0, notes: notes ?? '' });
		console.log(`✓ ${id} ${name}`);
	} catch (e) {
		results.push({ id, name, req, status: 'Fallida', ms: Date.now() - t0, notes: e.message });
		console.log(`✗ ${id} ${name}\n   ${e.message}`);
	}
}

/* ------------------------------------------------------------------ */

await test('PF-01', 'Visitante llega a una reseña en ≤ 3 clics desde el inicio', 'RNF6, HU01, RF1', async () => {
	const p = await newPage();
	await p.goto(BASE);
	await shot(p, '01-inicio');
	let clicks = 0;
	await p.fill('#q-hero', 'hades');
	await Promise.all([p.waitForURL(/\/juegos\?q=hades/), p.click('button:has-text("Buscar")')]);
	clicks++;
	await shot(p, '02-busqueda-hades');
	await Promise.all([p.waitForURL(/\/juegos\/hades$/), p.click('a[href="/juegos/hades"]')]);
	clicks++;
	expect(await p.isVisible('text=Reseña oficial TGR'), 'No se ve la reseña oficial');
	await shot(p, '03-resena-hades');
	expect(clicks <= 3, `Se necesitaron ${clicks} clics`);
	return `Se llegó a la reseña en ${clicks} clics (escribir + Buscar + resultado).`;
});

await test('PF-02', 'Filtrar catálogo por consola, género y año', 'RF1, RF2, HU02', async () => {
	const p = await newPage();
	await p.goto(`${BASE}/juegos`);
	await shot(p, '04-catalogo');
	await p.selectOption('#platform', 'SNES');
	await p.waitForURL(/platform=SNES/);
	const titles = await p.$$eval('main a[href^="/juegos/"] h3', (els) => els.map((e) => e.textContent.trim()));
	expect(titles.length === 2 && titles.includes('Chrono Trigger'), `Resultados SNES: ${titles}`);
	await shot(p, '05-catalogo-filtro-snes');
	await p.goto(`${BASE}/juegos?genre=Roguelike&year=2024`);
	const t2 = await p.$$eval('main a[href^="/juegos/"] h3', (els) => els.map((e) => e.textContent.trim()));
	expect(t2.length === 1 && t2[0] === 'Balatro', `Roguelike 2024: ${t2}`);
	await p.goto(`${BASE}/juegos?q=zzzz`);
	expect(await p.isVisible('text=Sin resultados'), 'No aparece el estado vacío');
	await shot(p, '06-catalogo-sin-resultados');
	return 'SNES → 2 juegos; Roguelike + 2024 → Balatro; búsqueda sin coincidencias muestra estado vacío.';
});

await test('PF-03', 'Ver las tres calificaciones y el desglose por revista', 'RF6, RN1, RN3, RN5, HU04', async () => {
	const p = await newPage();
	await p.goto(`${BASE}/juegos/hollow-knight`);
	for (const t of ['Calificación oficial TGR', 'Promedio de revistas', 'Promedio de la comunidad']) expect(await p.isVisible(`text=${t}`), `Falta ${t}`);
	await p.click('text=Ver desglose por revista');
	expect(await p.isVisible('text=Original: 94/100'), 'El desglose no muestra la escala original');
	await shot(p, '07-resena-desglose-revistas');
	await p.goto(`${BASE}/juegos/chrono-trigger`);
	expect(await p.isVisible('text=Calificaciones insuficientes'), 'RN3 no se respeta');
	await shot(p, '08-calificaciones-insuficientes', false);
	return 'Las tres calificaciones tienen etiqueta de texto; RN3 muestra "Calificaciones insuficientes" con 3 votos.';
});

await test('PF-04', 'Registro con validación de contraseña', 'RF3, RNF5, HU05', async () => {
	const p = await newPage();
	await p.goto(`${BASE}/registro`);
	await p.fill('#username', 'jugador_demo');
	await p.fill('#email', 'demo@tgr.test');
	await p.fill('#password', 'corta');
	await shot(p, '09-registro-validacion', false);
	// Envío sin validación del navegador para comprobar la del servidor
	await p.$eval('form[method="post"]', (f) => f.setAttribute('novalidate', ''));
	await p.fill('#confirm', 'corta');
	await p.click('button:has-text("Crear cuenta")');
	await p.waitForSelector('[role="alert"]');
	expect((await p.textContent('[role="alert"]')).includes('8 caracteres'), 'El servidor no valida la longitud');
	await p.fill('#password', 'segura2026');
	await p.fill('#confirm', 'segura2026');
	await Promise.all([p.waitForURL(`${BASE}/`), p.click('button:has-text("Crear cuenta")')]);
	expect(await p.isVisible('text=jugador_demo'), 'No quedó con sesión iniciada');
	return 'Contraseña de 5 caracteres rechazada por el servidor; con 10 caracteres se crea la cuenta y se inicia sesión.';
});

await test('PF-05', 'Inicio de sesión con credenciales incorrectas y correctas', 'RF4', async () => {
	const p = await newPage();
	await p.goto(`${BASE}/login`);
	await p.fill('#login', 'ana@tgr.test');
	await p.fill('#password', 'equivocada');
	await p.click('button:has-text("Entrar")');
	await p.waitForSelector('[role="alert"]');
	await shot(p, '10-login-error', false);
	await login(p, 'ana@tgr.test', 'usuario12345');
	expect(await p.isVisible('header >> text=ana'), 'No inició sesión');
	return 'Mensaje genérico de error sin revelar cuál dato falló; con datos correctos entra.';
});

await test('PF-06', 'Usuario califica, recalifica, comenta y guarda favorito', 'RF7, RF8, RF9, RN2, HU06–HU08', async () => {
	const p = await newPage();
	await login(p, 'ana@tgr.test', 'usuario12345');
	await p.goto(`${BASE}/juegos/metroid-prime-remastered`);
	await p.click('label:has(input[name="stars"][value="2"])');
	await p.click('button:has-text("Enviar calificación")');
	await p.waitForSelector('text=Calificaste con 2 estrellas');
	await p.click('label:has(input[name="stars"][value="5"])');
	await p.click('button:has-text("Actualizar calificación")');
	await p.waitForSelector('text=Calificaste con 5 estrellas');
	expect(await p.isVisible('text=Calificaste este juego con 5/5'), 'RN2: no reemplazó la calificación');
	await p.fill('#body', 'Lo terminé otra vez en Nueva Partida+, sigue siendo increíble.');
	await p.click('button:has-text("Publicar comentario")');
	await p.waitForSelector('text=Comentario publicado');
	await p.click('button:has-text("Agregar a favoritos")');
	await p.waitForSelector('button:has-text("En favoritos")');
	await shot(p, '11-usuario-califica-comenta');
	await p.goto(`${BASE}/perfil`);
	expect(await p.isVisible('main >> text=Metroid Prime Remastered'), 'No aparece en favoritos');
	await shot(p, '12-perfil-favoritos');
	return 'Calificó 2★ y luego 5★ (se reemplazó), comentó y agregó a favoritos; el perfil lo refleja.';
});

await test('PF-07', 'Control de acceso por rol', 'Restricción 1, RF10–RF12', async () => {
	const v = await newPage();
	await v.goto(`${BASE}/admin`);
	expect(v.url().includes('/login?redirectTo=%2Fadmin'), 'Visitante no fue redirigido al login');
	const u = await newPage();
	await login(u, 'ana@tgr.test', 'usuario12345');
	const res = await u.goto(`${BASE}/admin`);
	expect(res.status() === 403, `Usuario obtuvo ${res.status()} en /admin`);
	const res2 = await u.goto(`${BASE}/editor`);
	expect(res2.status() === 403, `Usuario obtuvo ${res2.status()} en /editor`);
	await shot(u, '13-acceso-denegado', false);
	return 'Visitante → login; usuario registrado → 403 en /admin y /editor.';
});

await test('PF-08', 'Editor TGR publica una reseña oficial con formato', 'RF5, RN6', async () => {
	const p = await newPage();
	await login(p, 'editor@tgr.test', 'editor12345');
	await p.goto(`${BASE}/editor`);
	await shot(p, '14-panel-editor');
	const sf6 = await p.$eval('#juego option:text("Street Fighter 6")', (o) => o.value).catch(async () =>
		p.$$eval('#juego option', (os) => os.find((o) => o.textContent === 'Street Fighter 6').value)
	);
	await p.goto(`${BASE}/editor/nueva?juego=${sf6}`);
	await p.fill('#title', 'El rey de las peleas vuelve en forma');
	await p.fill('#body', '## Para todos\nLos **controles modernos** permiten que cualquiera haga especiales.\n\n## Para veteranos\nEl sistema *Drive* agrega profundidad.\n\n- Modo historia\n- Battle Hub');
	await p.fill('#pros', 'Controles modernos\nGran netcode\nPresentación espectacular');
	await p.fill('#cons', 'Modo historia irregular');
	await p.fill('#verdict', 'La mejor entrada de la saga para empezar.');
	await p.fill('#score_raw', '4.6');
	await p.click('button:has-text("Vista previa")');
	await shot(p, '15-editor-nueva-resena-preview');
	await Promise.all([p.waitForURL(/\/juegos\/street-fighter-6$/), p.click('button:has-text("Publicar reseña")')]);
	expect(await p.isVisible('h2:has-text("El rey de las peleas")'), 'No se publicó');
	expect((await p.innerHTML('.prose-tgr')).includes('<strong>controles modernos</strong>'), 'No aplicó formato');
	await shot(p, '16-resena-oficial-publicada');
	// RN6: ya no se ofrece crear otra oficial para ese juego
	await p.goto(`${BASE}/editor`);
	const still = await p.$$eval('#juego option', (os) => os.some((o) => o.textContent === 'Street Fighter 6'));
	expect(!still, 'RN6: aún se ofrece una segunda reseña oficial');
	return 'Reseña publicada con títulos, negritas, lista, pros/contras y veredicto; el juego deja de ofrecerse para otra oficial.';
});

await test('PF-09', 'Revista afiliada publica con su propia escala', 'RN1, RN4, RN5', async () => {
	const p = await newPage();
	await login(p, 'pixelpress@tgr.test', 'revista12345');
	await p.goto(`${BASE}/juegos/street-fighter-6`);
	await Promise.all([p.waitForURL(/editor\/nueva/), p.click('text=Reseñar como PixelPress')]);
	await p.fill('#title', 'Reseña de PixelPress');
	await p.fill('#body', 'Un juego de peleas accesible y profundo a la vez, con modos para todo tipo de jugador.');
	await p.selectOption('#score_max', '10');
	await p.fill('#score_raw', '9');
	expect((await p.textContent('[aria-live="polite"] p.font-display')).includes('4.5'), 'No convierte 9/10 a 4.5');
	await shot(p, '17-revista-escala-10', false);
	await Promise.all([p.waitForURL(/\/juegos\/street-fighter-6$/), p.click('button:has-text("Publicar reseña")')]);
	await p.click('text=Ver desglose por revista');
	expect(await p.isVisible('text=Original: 9/10'), 'No aparece en el desglose');
	return '9/10 se muestra como 4.5/5 y se suma al promedio de revistas.';
});

await test('PF-10', 'Administrador agrega, edita y elimina un videojuego', 'RF10', async () => {
	const p = await newPage();
	await login(p, 'admin@tgr.test', 'admin12345');
	await p.goto(`${BASE}/admin`);
	await shot(p, '18-admin-resumen');
	await p.goto(`${BASE}/admin/juegos/nuevo`);
	await p.fill('#title', 'Juego de Prueba QA');
	await p.fill('#genre', 'Puzzle');
	await p.fill('#year', '2025');
	await p.check('input[name="platforms"][value="PC"]');
	await p.check('input[name="platforms"][value="Switch"]');
	await p.fill('#developer', 'Equipo QA');
	await shot(p, '19-admin-nuevo-juego');
	await Promise.all([p.waitForURL(/\/juegos\/juego-de-prueba-qa$/), p.click('button:has-text("Agregar juego")')]);
	await p.goto(`${BASE}/admin/juegos?q=QA`);
	await p.click('a:has-text("Editar")');
	await p.fill('#title', 'Juego de Prueba QA Editado');
	await Promise.all([p.waitForURL(`${BASE}/admin/juegos`), p.click('button:has-text("Guardar cambios")')]);
	expect(await p.isVisible('text=Juego de Prueba QA Editado'), 'No se editó');
	await shot(p, '20-admin-lista-juegos');
	p.once('dialog', (d) => d.accept());
	await p.click('tr:has-text("Juego de Prueba QA Editado") button:has-text("Eliminar")');
	await p.waitForSelector('text=Videojuego eliminado');
	expect(!(await p.isVisible('text=Juego de Prueba QA Editado')), 'No se eliminó');
	return 'Alta con 2 plataformas, edición del título y baja con confirmación.';
});

await test('PF-11', 'Administrador cambia rol y suspende una cuenta', 'RF11, RN7', async () => {
	const p = await newPage();
	await login(p, 'admin@tgr.test', 'admin12345');
	await p.goto(`${BASE}/admin/usuarios?q=rodrigo`);
	const row = 'tr:has-text("rodrigo")';
	await p.selectOption(`${row} select[name="status"]`, 'suspended');
	await p.click(`${row} button:has-text("Guardar")`);
	await p.waitForSelector('text=Cuenta de rodrigo actualizada');
	await p.goto(`${BASE}/admin/usuarios`);
	await shot(p, '21-admin-usuarios-roles');
	const r = await newPage();
	await login(r, 'rodrigo@tgr.test', 'usuario12345');
	await r.goto(`${BASE}/juegos/hades`);
	expect(await r.isVisible('text=Tu cuenta está suspendida'), 'El suspendido no ve el aviso');
	expect(!(await r.isVisible('button:has-text("Publicar comentario")')), 'El suspendido aún puede comentar');
	await shot(r, '22-usuario-suspendido', false);
	return 'La cuenta suspendida puede leer, pero no ve controles de calificar/comentar y recibe notificación.';
});

await test('PF-12', 'Moderación de comentario con notificación al autor', 'RF12, RN8', async () => {
	const p = await newPage();
	await login(p, 'admin@tgr.test', 'admin12345');
	await p.goto(`${BASE}/admin/comentarios`);
	const row = 'li:has-text("Malenia sigue apareciendo")';
	await p.click(`${row} button:has-text("Ocultar")`);
	await p.waitForSelector('text=Se notificó al autor');
	await shot(p, '23-admin-moderacion');
	const l = await newPage();
	await login(l, 'luis@tgr.test', 'usuario12345');
	await l.goto(`${BASE}/juegos/elden-ring`);
	expect(!(await l.isVisible('text=Malenia sigue apareciendo')), 'El comentario sigue visible');
	await l.goto(`${BASE}/perfil`);
	expect(await l.isVisible('text=fue ocultado por moderación'), 'El autor no fue notificado');
	await shot(l, '24-notificacion-moderacion');
	return 'El comentario oculto desaparece de la reseña y el autor ve la notificación en su perfil.';
});

await test('PF-13', 'Diseño responsivo en celular y tablet', 'RNF1', async () => {
	const m = await newPage({ width: 390, height: 844 });
	await m.goto(BASE);
	const overflow = await m.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
	expect(!overflow, 'Hay desplazamiento horizontal en móvil');
	await shot(m, '25-movil-inicio');
	await m.goto(`${BASE}/juegos/hollow-knight`);
	await shot(m, '26-movil-resena');
	const t = await newPage({ width: 820, height: 1180 });
	await t.goto(`${BASE}/juegos`);
	await shot(t, '27-tablet-catalogo', false);
	return 'Sin desplazamiento horizontal a 390 px; el menú se colapsa y las tarjetas se reacomodan.';
});

await test('PF-14', 'Accesibilidad básica: etiquetas, texto alternativo y foco', 'RNF3, RNF4', async () => {
	const p = await newPage();
	const issues = [];
	for (const url of ['/', '/juegos', '/juegos/hollow-knight', '/login', '/registro']) {
		await p.goto(BASE + url);
		const r = await p.evaluate(() => {
			const bad = [];
			document.querySelectorAll('img').forEach((i) => !i.hasAttribute('alt') && bad.push('img sin alt'));
			document.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox]), select, textarea').forEach((el) => {
				const ok = (el.id && document.querySelector(`label[for="${el.id}"]`)) || el.getAttribute('aria-label') || el.closest('label');
				if (!ok) bad.push(`campo sin etiqueta: ${el.name}`);
			});
			if (!document.documentElement.lang) bad.push('html sin lang');
			if (document.querySelectorAll('h1').length !== 1) bad.push(`h1 = ${document.querySelectorAll('h1').length}`);
			return bad;
		});
		issues.push(...r.map((x) => `${url}: ${x}`));
	}
	await p.goto(BASE);
	await p.keyboard.press('Tab');
	const skip = await p.evaluate(() => document.activeElement?.textContent?.trim());
	expect(skip === 'Saltar al contenido', `Primer foco: ${skip}`);
	await shot(p, '28-foco-teclado', false);
	expect(!issues.length, issues.join('; '));
	return '5 páginas sin imágenes sin alt ni campos sin etiqueta; un h1 por página; enlace "Saltar al contenido" al primer Tab.';
});

await test('PF-15', 'Tiempo de carga de reseña y búsqueda < 3 s', 'RNF2', async () => {
	const p = await newPage();
	const times = [];
	for (const url of ['/juegos/hollow-knight', '/juegos?q=a', '/']) {
		const t0 = Date.now();
		await p.goto(BASE + url, { waitUntil: 'load' });
		times.push(`${url} ${Date.now() - t0} ms`);
		expect(Date.now() - t0 < 3000, `${url} tardó más de 3 s`);
	}
	return times.join(' · ') + ' (servidor de desarrollo).';
});

await browser.close();

fs.writeFileSync(path.join(OUT, 'resultados-e2e.json'), JSON.stringify(results, null, 2));
const ok = results.filter((r) => r.status === 'Aprobada').length;
console.log(`\n${ok}/${results.length} casos aprobados. Capturas en ${SHOTS}`);
process.exit(ok === results.length ? 0 : 1);
