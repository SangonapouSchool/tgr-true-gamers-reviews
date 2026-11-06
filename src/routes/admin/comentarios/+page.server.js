import { listAllComments, moderateComment } from '#lib/server/repo.js';
import { run } from '#lib/server/actions.js';

export function load({ locals, url }) {
	const filter = url.searchParams.get('filter') ?? 'all';
	return { filter, comments: listAllComments(locals.db, { filter }) };
}

const LABEL = { hide: 'ocultado', unhide: 'restaurado', delete: 'eliminado' };

/** RF12 + RN8 — moderar comentarios. */
export const actions = {
	moderate: ({ locals, request }) =>
		run(async () => {
			const fd = await request.formData();
			const action = String(fd.get('action'));
			moderateComment(locals.db, locals.user, Number(fd.get('id')), action);
			return { ok: true, message: `Comentario ${LABEL[action]}.${action !== 'unhide' ? ' Se notificó al autor.' : ''}` };
		})
};
