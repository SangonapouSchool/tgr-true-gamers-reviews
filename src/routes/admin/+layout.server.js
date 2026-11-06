import { guard } from '#lib/server/actions.js';

/** Sólo administradores (RF10, RF11, RF12). */
export function load({ locals, url }) {
	guard(locals, url, 'manage_users');
}
