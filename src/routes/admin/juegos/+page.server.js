import { searchGames, deleteGame } from '#lib/server/repo.js';
import { run } from '#lib/server/actions.js';

export function load({ locals, url }) {
	const q = url.searchParams.get('q') ?? '';
	return { q, games: searchGames(locals.db, { q, sort: 'title', limit: 1000 }) };
}

/** RF10 — eliminar videojuego. */
export const actions = {
	delete: ({ locals, request }) =>
		run(async () => {
			const id = Number((await request.formData()).get('id'));
			deleteGame(locals.db, locals.user, id);
			return { ok: true, message: 'Videojuego eliminado.' };
		})
};
