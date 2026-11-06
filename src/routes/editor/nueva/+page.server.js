import { error, redirect } from '@sveltejs/kit';
import { createReview, getGameById } from '#lib/server/repo.js';
import { run, formToObject } from '#lib/server/actions.js';
import { saveImage } from '#lib/server/uploads.js';

export function load({ locals, url }) {
	const game = getGameById(locals.db, Number(url.searchParams.get('juego')));
	if (!game) error(404, 'Selecciona un videojuego válido.');
	return { game };
}

/** RF5 — publicar una reseña nueva. */
export const actions = {
	default: async ({ locals, url, request }) => {
		const fd = await request.formData();
		const values = formToObject(fd);
		const gameId = Number(url.searchParams.get('juego'));
		const result = await run(async () => {
			const image = await saveImage(fd.get('image_file'));
			const review = createReview(locals.db, locals.user, gameId, { ...values, image });
			return { created: review };
		}, values);
		if (result?.created) redirect(303, `/juegos/${result.created.game_slug}`);
		return result;
	}
};
