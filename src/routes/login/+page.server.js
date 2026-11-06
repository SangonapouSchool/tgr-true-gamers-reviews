import { fail, redirect } from '@sveltejs/kit';
import { authenticate } from '#lib/server/repo.js';
import { startSession, safeRedirect } from '#lib/server/session.js';

export function load({ locals, url }) {
	if (locals.user) redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
}

/** RF4 — inicio de sesión. */
export const actions = {
	default: async ({ request, cookies, locals, url }) => {
		const fd = await request.formData();
		const login = String(fd.get('login') ?? '');
		const user = authenticate(locals.db, login, fd.get('password'));
		if (!user) return fail(400, { error: 'Correo/usuario o contraseña incorrectos.', login });
		startSession(cookies, locals.db, user.id);
		redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
	}
};
