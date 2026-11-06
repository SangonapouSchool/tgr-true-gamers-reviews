import * as repo from '#lib/server/repo.js';
import { guard } from '#lib/server/actions.js';

export function load({ locals, url }) {
	const user = guard(locals, url);
	return {
		favorites: repo.listFavorites(locals.db, user.id),
		ratings: repo.listUserRatings(locals.db, user.id),
		notifications: repo.listNotifications(locals.db, user.id)
	};
}

export const actions = {
	read: ({ locals, url }) => {
		const user = guard(locals, url);
		repo.markNotificationsRead(locals.db, user.id);
		return { ok: true };
	}
};
