import { searchGames, getFacets, getStats } from '#lib/server/repo.js';

export function load({ locals }) {
	const db = locals.db;
	return {
		recent: searchGames(db, { sort: 'recent', limit: 8 }),
		top: searchGames(db, { sort: 'score', limit: 5 }),
		facets: getFacets(db),
		stats: getStats(db)
	};
}
