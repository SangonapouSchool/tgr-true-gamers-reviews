<script>
	/**
	 * Formulario de reseña (RF5): texto con formato, pros, contras, veredicto,
	 * calificación en la escala de la revista e imagen con texto alternativo.
	 */
	import { renderMarkdown } from '#lib/markdown.js';
	import { normalizeScore } from '#lib/scoring.js';
	import Alert from './Alert.svelte';

	let { review = {}, game, kindLabel, error = null, submitLabel = 'Publicar reseña', action = undefined } = $props();

	let body = $state(review.body ?? '');
	let scoreRaw = $state(review.score_raw ?? '');
	let scoreMax = $state(String(review.score_max ?? 5));
	let preview = $state(false);
	let textarea;

	const normalized = $derived.by(() => {
		try {
			return scoreRaw === '' ? null : normalizeScore(Number(scoreRaw), Number(scoreMax));
		} catch {
			return null;
		}
	});

	/** Inserta marcas de formato alrededor de la selección. */
	function wrap(before, after = '') {
		const { selectionStart: s, selectionEnd: e } = textarea;
		const sel = body.slice(s, e) || 'texto';
		body = body.slice(0, s) + before + sel + after + body.slice(e);
		queueMicrotask(() => {
			textarea.focus();
			textarea.setSelectionRange(s + before.length, s + before.length + sel.length);
		});
	}
</script>

<form method="post" {action} enctype="multipart/form-data" class="space-y-6">
	{#if error}<Alert>{error}</Alert>{/if}

	<div class="card flex flex-wrap items-center gap-3 p-4">
		<span class="text-sm text-muted">Juego:</span>
		<span class="font-display text-lg font-bold">{game.title}</span>
		<span class="chip ml-auto">{kindLabel}</span>
	</div>

	<div>
		<label for="title" class="label">Título de la reseña *</label>
		<input id="title" name="title" defaultValue={review.title ?? ''} required minlength="3" maxlength="140" class="input text-lg" />
	</div>

	<div>
		<div class="mb-1 flex flex-wrap items-center justify-between gap-2">
			<label for="body" class="label mb-0">Texto de la reseña *</label>
			<div class="flex gap-1" role="toolbar" aria-label="Formato">
				<button type="button" class="btn-ghost px-2 py-1 text-xs" onclick={() => wrap('\n## ', '\n')} disabled={preview}>Título</button>
				<button type="button" class="btn-ghost px-2 py-1 text-xs" onclick={() => wrap('**', '**')} disabled={preview}><b>N</b><span class="sr-only">egrita</span></button>
				<button type="button" class="btn-ghost px-2 py-1 text-xs" onclick={() => wrap('*', '*')} disabled={preview}><i>C</i><span class="sr-only">ursiva</span></button>
				<button type="button" class="btn-ghost px-2 py-1 text-xs" onclick={() => wrap('\n- ', '')} disabled={preview}>Lista</button>
				<button type="button" class="btn-ghost px-2 py-1 text-xs" aria-pressed={preview} onclick={() => (preview = !preview)}>{preview ? 'Editar' : 'Vista previa'}</button>
			</div>
		</div>
		<textarea bind:this={textarea} id="body" name="body" bind:value={body} rows="14" required minlength="20" class="input font-mono text-sm {preview ? 'hidden' : ''}" aria-describedby="body-help"></textarea>
		{#if preview}
			<div class="prose-tgr card min-h-60 p-4">{@html renderMarkdown(body) || '<p class="text-muted">Nada que mostrar.</p>'}</div>
		{/if}
		<p id="body-help" class="mt-1 text-xs text-muted">Formato: <code>## Título</code>, <code>**negrita**</code>, <code>*cursiva*</code>, <code>- lista</code>. Deja una línea en blanco entre párrafos.</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2">
		<div>
			<label for="pros" class="label">Pros (uno por línea)</label>
			<textarea id="pros" name="pros" rows="5" class="input" defaultValue={review.pros ?? ''}></textarea>
		</div>
		<div>
			<label for="cons" class="label">Contras (uno por línea)</label>
			<textarea id="cons" name="cons" rows="5" class="input" defaultValue={review.cons ?? ''}></textarea>
		</div>
	</div>

	<div>
		<label for="verdict" class="label">Veredicto</label>
		<input id="verdict" name="verdict" defaultValue={review.verdict ?? ''} maxlength="240" class="input" />
	</div>

	<fieldset class="card grid gap-4 p-4 sm:grid-cols-3">
		<legend class="px-1 font-display text-sm font-semibold tracking-wider text-muted uppercase">Calificación</legend>
		<div>
			<label for="score_raw" class="label">Calificación *</label>
			<input id="score_raw" name="score_raw" type="number" step="0.1" min="0" max={scoreMax} bind:value={scoreRaw} required class="input" />
		</div>
		<div>
			<label for="score_max" class="label">Escala de la revista</label>
			<select id="score_max" name="score_max" bind:value={scoreMax} class="input">
				<option value="5">De 0 a 5</option>
				<option value="10">De 0 a 10</option>
				<option value="100">De 0 a 100</option>
			</select>
		</div>
		<div aria-live="polite">
			<p class="label">Se mostrará como</p>
			<p class="font-display text-2xl font-bold text-primary-soft">{normalized != null ? `${normalized.toFixed(1)} / 5` : '—'}</p>
		</div>
	</fieldset>

	<fieldset class="card grid gap-4 p-4 md:grid-cols-2">
		<legend class="px-1 font-display text-sm font-semibold tracking-wider text-muted uppercase">Imagen (opcional)</legend>
		<div>
			<label for="image_file" class="label">Archivo PNG, JPG o WEBP (máx. 3 MB)</label>
			<input id="image_file" name="image_file" type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="input file:mr-3 file:rounded file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-fg" />
			{#if review.image}
				<div class="mt-2 flex items-center gap-3 text-sm">
					<img src={review.image} alt={review.image_alt} class="h-14 rounded border border-line" />
					<label class="flex items-center gap-1"><input type="checkbox" name="remove_image" value="1" /> Quitar imagen</label>
				</div>
			{/if}
		</div>
		<div>
			<label for="image_alt" class="label">Texto alternativo (obligatorio si hay imagen)</label>
			<input id="image_alt" name="image_alt" defaultValue={review.image_alt ?? ''} maxlength="200" class="input" placeholder="Describe lo que muestra la imagen" />
		</div>
	</fieldset>

	<div class="flex flex-wrap justify-end gap-2">
		<a href="/editor" class="btn-ghost">Cancelar</a>
		<button class="btn-primary">{submitLabel}</button>
	</div>
</form>
