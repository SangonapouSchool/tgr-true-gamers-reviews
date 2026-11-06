import fs from 'node:fs';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { RuleError } from './repo.js';

export const UPLOAD_DIR = process.env.TGR_UPLOADS ?? path.resolve('data', 'uploads');
const TYPES = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
const MAX = 3 * 1024 * 1024;

/** Guarda una imagen subida y regresa su URL pública, o null si no se envió archivo. */
export async function saveImage(file) {
	if (!(file instanceof File) || file.size === 0) return null;
	const ext = TYPES[file.type];
	if (!ext) throw new RuleError('La imagen debe ser PNG, JPG, WEBP o GIF.');
	if (file.size > MAX) throw new RuleError('La imagen no puede pesar más de 3 MB.');
	fs.mkdirSync(UPLOAD_DIR, { recursive: true });
	const name = `${randomBytes(12).toString('hex')}.${ext}`;
	fs.writeFileSync(path.join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
	return `/uploads/${name}`;
}

export const MIME = Object.fromEntries(Object.entries(TYPES).map(([m, e]) => [e, m]));
