import { error } from '@sveltejs/kit';
import * as repo from '#lib/server/repo.js';
import { run } from '#lib/server/actions.js';
import { renderMarkdown, linesToList } from '#lib/markdown.js';
import { can } from '#lib/permissions.js';

/** Página de reseña de un videojuego (RF6, HU03, HU04). */
export function load({ locals, params }) {
	const db = locals.db;
	const game = repo.getGameBySlug(db, params.slug);
	if (!game) error(404, 'Ese videojuego no está en el catálogo.');
	const { official, outlets } = repo.getReviewsForGame(db, game.id);
	const user = locals.user;
	return {
		game,
		official: official && {
			...official,
			html: renderMarkdown(official.body),
			pros: linesToList(official.pros),
			cons: linesToList(official.cons)
		},
		outlets,
		comments: repo.listComments(db, game.id),
		myRating: user ? repo.getUserRating(db, user.id, game.id) : null,
		favorite: user ? repo.isFavorite(db, user.id, game.id) : false,
		canParticipate: can(user, 'comment'),
		canWriteOfficial: can(user, 'write_official'),
		canWriteOutlet: !!user?.outlet && can(user, 'write_review') && !outlets.some((o) => o.outlet === user.outlet)
	};
}

const gameIdFor = (locals, slug) => repo.getGameBySlug(locals.db, slug)?.id;

export const actions = {
	/** RF7 + RN2 */
	rate: ({ locals, params, request }) =>
		run(async () => {
			const fd = await request.formData();
			const stars = repo.rateGame(locals.db, locals.user, gameIdFor(locals, params.slug), fd.get('stars'));
			return { ok: true, message: `¡Gracias! Calificaste con ${stars} ${stars === 1 ? 'estrella' : 'estrellas'}.` };
		}),
	/** RF9 */
	favorite: ({ locals, params }) =>
		run(() => {
			const on = repo.toggleFavorite(locals.db, locals.user, gameIdFor(locals, params.slug));
			return { ok: true, message: on ? 'Agregado a tus favoritos.' : 'Quitado de tus favoritos.' };
		}),
	/** RF8 */
	comment: ({ locals, params, request }) =>
		run(async () => {
			const body = (await request.formData()).get('body');
			repo.addComment(locals.db, locals.user, gameIdFor(locals, params.slug), body);
			return { ok: true, message: 'Comentario publicado.', commented: true };
		})
};
