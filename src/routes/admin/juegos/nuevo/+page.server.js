import { redirect } from '@sveltejs/kit';
import { createGame, getFacets } from '#lib/server/repo.js';
import { run, formToObject } from '#lib/server/actions.js';

export function load({ locals }) {
	return { facets: getFacets(locals.db) };
}

/** RF10 — agregar videojuego. */
export const actions = {
	default: async ({ locals, request }) => {
		const values = formToObject(await request.formData());
		const result = await run(() => ({ game: createGame(locals.db, locals.user, values) }), values);
		if (result?.game) redirect(303, `/juegos/${result.game.slug}`);
		return result;
	}
};
