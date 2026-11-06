<script>
	/** Formulario de alta/edición de videojuego (RF10). */
	import GameCover from './GameCover.svelte';
	import Alert from './Alert.svelte';

	let { game = {}, platforms = [], genres = [], error = null, submitLabel = 'Guardar' } = $props();

	const COMMON = ['PC', 'PS5', 'PS4', 'Xbox Series', 'Xbox One', 'Switch', 'Móvil', 'SNES', 'Genesis', 'Game Boy'];
	const options = $derived([...new Set([...COMMON, ...platforms])]);
	let title = $state(game.title ?? '');
	let hue = $state(game.cover_hue ?? 260);
	let selected = $state(new Set(game.platforms ?? []));
	let extra = $state('');
	// Portada: archivo nuevo (vista previa local), dirección pegada, o la actual
	let filePreview = $state(null);
	let coverUrl = $state('');
	let removeCover = $state(false);
	const previewImage = $derived(removeCover ? null : filePreview || coverUrl.trim() || game.cover_image || null);
	function pickFile(e) {
		const f = e.currentTarget.files?.[0];
		if (filePreview) URL.revokeObjectURL(filePreview);
		filePreview = f ? URL.createObjectURL(f) : null;
	}
</script>

<form method="post" enctype="multipart/form-data" class="grid gap-6 md:grid-cols-[1fr_200px]">
	<div class="space-y-4">
		{#if error}<Alert>{error}</Alert>{/if}
		<div>
			<label for="title" class="label">Título *</label>
			<input id="title" name="title" bind:value={title} required maxlength="120" class="input" />
		</div>
		<div class="grid gap-4 sm:grid-cols-3">
			<div class="sm:col-span-2">
				<label for="genre" class="label">Género *</label>
				<input id="genre" name="genre" defaultValue={game.genre ?? ''} list="genres" required class="input" />
				<datalist id="genres">{#each genres as g (g)}<option value={g}></option>{/each}</datalist>
			</div>
			<div>
				<label for="year" class="label">Año de lanzamiento *</label>
				<input id="year" name="year" type="number" min="1970" max="2030" defaultValue={game.year ?? ''} required class="input" />
			</div>
		</div>
		<fieldset>
			<legend class="label">Consolas / plataformas * (elige al menos una)</legend>
			<div class="flex flex-wrap gap-2">
				{#each options as p (p)}
					<label class="chip cursor-pointer gap-1.5 py-1.5 text-sm has-checked:border-primary-soft has-checked:bg-primary/20 has-checked:text-fg">
						<input type="checkbox" name="platforms" value={p} defaultChecked={selected.has(p)} class="accent-[var(--color-primary)]" />
						{p}
					</label>
				{/each}
			</div>
			<label for="extra" class="mt-2 block text-xs text-muted">¿Otra? Escríbela (separa varias con coma)</label>
			<input id="extra" name="platforms" bind:value={extra} class="input mt-1" placeholder="Ej. Dreamcast" />
		</fieldset>
		<div>
			<label for="developer" class="label">Desarrollador</label>
			<input id="developer" name="developer" defaultValue={game.developer ?? ''} class="input" />
		</div>
		<div>
			<label for="synopsis" class="label">Sinopsis</label>
			<textarea id="synopsis" name="synopsis" rows="4" maxlength="600" class="input" defaultValue={game.synopsis ?? ''}></textarea>
		</div>
		<div class="flex justify-end gap-2">
			<a href="/admin/juegos" class="btn-ghost">Cancelar</a>
			<button class="btn-primary">{submitLabel}</button>
		</div>
	</div>
	<aside class="space-y-3">
		<p class="label">Vista previa de portada</p>
		{#key previewImage}<GameCover title={title || 'Título del juego'} {hue} image={previewImage} />{/key}
		<div>
			<label for="cover_file" class="label">Imagen de portada (PNG, JPG o WEBP)</label>
			<input id="cover_file" name="cover_file" type="file" accept="image/png,image/jpeg,image/webp" onchange={pickFile} class="w-full text-xs text-muted file:mr-2 file:rounded file:border-0 file:bg-surface-2 file:px-2 file:py-1 file:text-fg" />
		</div>
		<div>
			<label for="cover_url" class="label">…o dirección de la imagen (https)</label>
			<input id="cover_url" name="cover_url" type="url" bind:value={coverUrl} placeholder="https://…" class="input py-1 text-sm" />
		</div>
		{#if game.cover_image}
			<label class="flex items-center gap-2 text-sm text-muted"><input type="checkbox" name="remove_cover" value="1" bind:checked={removeCover} /> Quitar la portada actual</label>
		{/if}
		<label for="cover_hue" class="label">Color de la portada generada</label>
		<input id="cover_hue" name="cover_hue" type="range" min="0" max="359" bind:value={hue} class="w-full accent-[var(--color-primary)]" />
		<p class="text-xs text-muted">Sin imagen, se muestra una portada generada con este color.</p>
	</aside>
</form>
