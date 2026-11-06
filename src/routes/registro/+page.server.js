import { fail, redirect } from '@sveltejs/kit';
import { registerUser, RuleError } from '#lib/server/repo.js';
import { startSession, safeRedirect } from '#lib/server/session.js';

export function load({ locals }) {
	if (locals.user) redirect(303, '/');
}

/** RF3 — registro de nuevos usuarios. */
export const actions = {
	default: async ({ request, cookies, locals, url }) => {
		const fd = await request.formData();
		const values = { username: String(fd.get('username') ?? ''), email: String(fd.get('email') ?? '') };
		if (fd.get('password') !== fd.get('confirm')) return fail(400, { error: 'Las contraseñas no coinciden.', values });
		try {
			const user = registerUser(locals.db, { ...values, password: fd.get('password') });
			startSession(cookies, locals.db, user.id);
		} catch (e) {
			if (e instanceof RuleError) return fail(400, { error: e.message, values });
			throw e;
		}
		redirect(303, safeRedirect(url.searchParams.get('redirectTo')));
	}
};
