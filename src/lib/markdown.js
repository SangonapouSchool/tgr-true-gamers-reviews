/**
 * Renderizador mínimo y seguro de formato para las reseñas (RF5 "formatear").
 * Soporta: ## títulos, ### subtítulos, **negritas**, *cursivas*, listas con "- " o "1. ",
 * y párrafos separados por línea en blanco. Todo el HTML del autor se escapa primero,
 * por lo que no es posible inyectar etiquetas o scripts.
 */

export function escapeHtml(s) {
	return String(s)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

function inline(s) {
	return s
		.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
		.replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>');
}

/** @param {string} src */
export function renderMarkdown(src) {
	const lines = escapeHtml(src ?? '').replace(/\r\n?/g, '\n').split('\n');
	const out = [];
	let para = [];
	let list = null; // { tag: 'ul'|'ol', items: [] }

	const flushPara = () => {
		if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
		para = [];
	};
	const flushList = () => {
		if (list) out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`);
		list = null;
	};

	for (const raw of lines) {
		const line = raw.trim();
		let m;
		if (!line) {
			flushPara();
			flushList();
		} else if ((m = line.match(/^(#{2,3})\s+(.*)$/))) {
			flushPara();
			flushList();
			const tag = m[1].length === 2 ? 'h2' : 'h3';
			out.push(`<${tag}>${inline(m[2])}</${tag}>`);
		} else if ((m = line.match(/^[-*]\s+(.*)$/)) || (m = line.match(/^\d+[.)]\s+(.*)$/))) {
			flushPara();
			const tag = /^\d/.test(line) ? 'ol' : 'ul';
			if (list && list.tag !== tag) flushList();
			list ??= { tag, items: [] };
			list.items.push(m[1]);
		} else {
			flushList();
			para.push(line);
		}
	}
	flushPara();
	flushList();
	return out.join('\n');
}

/** Convierte un campo de texto con un elemento por línea en arreglo (pros / contras). */
export function linesToList(text) {
	return String(text ?? '')
		.split(/\r?\n/)
		.map((l) => l.replace(/^[-*•]\s*/, '').trim())
		.filter(Boolean);
}
