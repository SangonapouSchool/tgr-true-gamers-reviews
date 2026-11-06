import { error, redirect } from '@sveltejs/kit';
import * as repo from '#lib/server/repo.js';
import { run, formToObject } from '#lib/server/actions.js';
import { saveImage } from '#lib/server/uploads.js';

export function load({ locals, params }) {
	const review = repo.getReview(locals.db, Number(params.id));
	if (!review) error(404, 'Reseña no encontrada.');
	if (!repo.canManageReview(locals.user, review)) error(403, 'No puedes editar esta reseña.');
	return { review, game: repo.getGameById(locals.db, review.game_id) };
}

/** RF5 — editar y eliminar reseñas. */
export const actions = {
	save: async ({ locals, params, request }) => {
		const fd = await request.formData();
		const values = formToObject(fd);
		const id = Number(params.id);
		const result = await run(async () => {
			const uploaded = await saveImage(fd.get('image_file'));
			const data = { ...values };
			if (uploaded) data.image = uploaded;
			else if (values.remove_image) data.image = '';
			return { saved: repo.updateReview(locals.db, locals.user, id, data) };
		}, values);
		if (result?.saved) redirect(303, `/juegos/${result.saved.game_slug}`);
		return result;
	},
	delete: ({ locals, params }) =>
		run(() => {
			repo.deleteReview(locals.db, locals.user, Number(params.id));
			redirect(303, '/editor');
		})
};
