import { unreadCount } from '#lib/server/repo.js';

export function load({ locals }) {
	return {
		user: locals.user,
		unread: locals.user ? unreadCount(locals.db, locals.user.id) : 0
	};
}
