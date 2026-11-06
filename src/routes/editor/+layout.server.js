import { guard } from '#lib/server/actions.js';

/** Sólo editores y administradores (Restricción 1 del SRS). */
export function load({ locals, url }) {
	guard(locals, url, 'write_review');
}
