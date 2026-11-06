import { listManageableReviews, searchGames } from '#lib/server/repo.js';

export function load({ locals }) {
	const user = locals.user;
	const reviews = listManageableReviews(locals.db, user);
	const games = searchGames(locals.db, { sort: 'title', limit: 1000 });
	// Juegos en los que esta cuenta todavía puede publicar
	const available = user.outlet
		? games.filter((g) => !reviews.some((r) => r.game_id === g.id && r.outlet === user.outlet))
		: games.filter((g) => g.scores.tgr == null);
	return { reviews, available };
}
