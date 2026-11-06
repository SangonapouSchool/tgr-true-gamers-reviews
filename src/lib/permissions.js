/**
 * Matriz de permisos por rol (actores del SRS).
 * visitante (sin sesión) · user (usuario registrado) · editor · admin
 */

export const ROLES = /** @type {const} */ (['user', 'editor', 'admin']);
export const ROLE_LABELS = { user: 'Usuario registrado', editor: 'Editor / Reseñador', admin: 'Administrador' };

/**
 * @param {{ role: string, status: string } | null | undefined} user
 * @param {'rate'|'comment'|'favorite'|'write_review'|'write_official'|'manage_games'|'manage_users'|'moderate'} action
 * @param {{ outlet?: string|null }} [ctx]
 */
export function can(user, action, ctx = {}) {
	if (!user) return false; // visitante: sólo lectura
	const active = user.status === 'active';
	switch (action) {
		// RN7: un usuario suspendido puede leer pero no calificar, comentar ni tocar favoritos
		case 'rate':
		case 'comment':
		case 'favorite':
			return active;
		// RF5 / Restricción 1: sólo editores y administradores publican reseñas
		case 'write_review':
			return active && (user.role === 'editor' || user.role === 'admin');
		// La reseña oficial de TGR la escriben editores de TGR (sin revista) o administradores
		case 'write_official':
			return active && (user.role === 'admin' || (user.role === 'editor' && !user.outlet));
		// RF10, RF11, RF12
		case 'manage_games':
		case 'manage_users':
		case 'moderate':
			return active && user.role === 'admin';
		default:
			return false;
	}
}
