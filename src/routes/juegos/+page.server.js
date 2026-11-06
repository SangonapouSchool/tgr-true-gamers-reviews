import { searchGames, getFacets } from '#lib/server/repo.js';

/** RF1 / RF2 — catálogo con búsqueda y filtros por título, consola, género y año. */
export function load({ locals, url }) {
	const filters = {
		q: url.searchParams.get('q')?.trim() ?? '',
		platform: url.searchParams.get('platform') ?? '',
		genre: url.searchParams.get('genre') ?? '',
		year: url.searchParams.get('year') ?? '',
		sort: url.searchParams.get('sort') ?? 'recent'
	};
	return {
		filters,
		games: searchGames(locals.db, { ...filters, limit: 200 }),
		facets: getFacets(locals.db)
	};
}
