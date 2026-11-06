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
</script>

<form method="post" class="grid gap-6 md:grid-cols-[1fr_200px]">
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
		<GameCover title={title || 'Título del juego'} {hue} />
		<label for="cover_hue" class="label">Color de portada</label>
		<input id="cover_hue" name="cover_hue" type="range" min="0" max="359" bind:value={hue} class="w-full accent-[var(--color-primary)]" />
	</aside>
</form>
