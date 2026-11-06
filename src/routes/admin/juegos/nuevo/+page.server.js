import { redirect } from '@sveltejs/kit';
import { createGame, getFacets } from '#lib/server/repo.js';
import { run, formToObject } from '#lib/server/actions.js';
import { coverFromForm } from '#lib/server/uploads.js';

export function load({ locals }) {
	return { facets: getFacets(locals.db) };
}

/** RF10 — agregar videojuego. */
export const actions = {
	default: async ({ locals, request }) => {
		const fd = await request.formData();
		const values = formToObject(fd);
		const result = await run(async () => ({ game: createGame(locals.db, locals.user, { ...values, cover_image: await coverFromForm(fd) }) }), values);
		if (result?.game) redirect(303, `/juegos/${result.game.slug}`);
		return result;
	}
};
