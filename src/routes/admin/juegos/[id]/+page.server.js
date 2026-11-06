import { error, redirect } from '@sveltejs/kit';
import { getGameById, updateGame, getFacets } from '#lib/server/repo.js';
import { run, formToObject } from '#lib/server/actions.js';

export function load({ locals, params }) {
	const game = getGameById(locals.db, Number(params.id));
	if (!game) error(404, 'Videojuego no encontrado.');
	return { game, facets: getFacets(locals.db) };
}

/** RF10 — editar videojuego. */
export const actions = {
	default: async ({ locals, params, request }) => {
		const values = formToObject(await request.formData());
		const result = await run(() => ({ game: updateGame(locals.db, locals.user, Number(params.id), values) }), values);
		if (result?.game) redirect(303, '/admin/juegos');
		return result;
	}
};
