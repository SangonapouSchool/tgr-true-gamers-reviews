import { unreadCount, listNotifications } from '#lib/server/repo.js';

export function load({ locals }) {
	return {
		user: locals.user,
		unread: locals.user ? unreadCount(locals.db, locals.user.id) : 0,
		// Últimas notificaciones para el menú de la campana
		latestNotifications: locals.user ? listNotifications(locals.db, locals.user.id).slice(0, 5) : []
	};
}
