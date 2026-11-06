import { fail, error, redirect } from '@sveltejs/kit';
import { RuleError } from './repo.js';
import { can } from '../permissions.js';

/**
 * Ejecuta una acción y convierte los errores de reglas de negocio en `fail()`
 * para que el formulario muestre el mensaje.
 */
export async function run(fn, values = {}) {
	try {
		return (await fn()) ?? { ok: true };
	} catch (e) {
		if (e instanceof RuleError) return fail(e.status, { error: e.message, values });
		throw e;
	}
}

/** Guarda de ruta: exige sesión (y opcionalmente un permiso). */
export function guard(locals, url, action) {
	if (!locals.user) redirect(303, `/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`);
	if (action && !can(locals.user, action)) error(403, 'No tienes permiso para ver esta sección.');
	return locals.user;
}

/** Convierte FormData en objeto plano (los campos repetidos se vuelven arreglo). */
export function formToObject(fd) {
	const out = {};
	for (const [k, v] of fd.entries()) {
		if (v instanceof File) continue;
		if (k in out) out[k] = [].concat(out[k], v);
		else out[k] = v;
	}
	return out;
}
