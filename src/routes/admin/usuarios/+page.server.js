import { listUsers, updateUserByAdmin } from '#lib/server/repo.js';
import { run } from '#lib/server/actions.js';

export function load({ locals, url }) {
	const q = url.searchParams.get('q') ?? '';
	const role = url.searchParams.get('role') ?? '';
	return { q, role, users: listUsers(locals.db, { q, role }) };
}

/** RF11 — cambiar rol / estado / revista de un usuario. */
export const actions = {
	update: ({ locals, request }) =>
		run(async () => {
			const fd = await request.formData();
			const u = updateUserByAdmin(locals.db, locals.user, Number(fd.get('id')), {
				role: fd.get('role') ?? undefined,
				status: fd.get('status') ?? undefined,
				outlet: fd.has('outlet') ? String(fd.get('outlet')) : undefined
			});
			return { ok: true, message: `Cuenta de ${u.username} actualizada.` };
		})
};
