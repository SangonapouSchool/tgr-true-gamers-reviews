import { getStats, listAllComments, listUsers } from '#lib/server/repo.js';

export function load({ locals }) {
	return {
		stats: getStats(locals.db),
		latestComments: listAllComments(locals.db).slice(0, 5),
		latestUsers: listUsers(locals.db).slice(0, 5)
	};
}
