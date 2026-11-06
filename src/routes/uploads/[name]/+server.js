import fs from 'node:fs';
import path from 'node:path';
import { error } from '@sveltejs/kit';
import { UPLOAD_DIR, MIME } from '#lib/server/uploads.js';

/** Sirve las imágenes subidas por los editores. */
export function GET({ params }) {
	if (!/^[a-f0-9]{24}\.(png|jpg|webp|gif)$/.test(params.name)) error(404, 'No encontrado');
	const file = path.join(UPLOAD_DIR, params.name);
	if (!fs.existsSync(file)) error(404, 'No encontrado');
	return new Response(fs.readFileSync(file), {
		headers: { 'content-type': MIME[params.name.split('.').pop()], 'cache-control': 'public, max-age=31536000, immutable' }
	});
}
