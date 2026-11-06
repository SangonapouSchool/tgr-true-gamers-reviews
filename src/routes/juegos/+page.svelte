<script>
	import GameCard from '#lib/components/GameCard.svelte';
	let { data } = $props();
	const f = $derived(data.filters);
	const hasFilters = $derived(!!(f.q || f.platform || f.genre || f.year));
</script>

<svelte:head><title>Catálogo de videojuegos · TGR</title></svelte:head>

<div class="mb-6 flex flex-wrap items-end justify-between gap-3">
	<div>
		<h1 class="text-3xl font-bold">Catálogo</h1>
		<p class="text-muted" aria-live="polite">
			{data.games.length}
			{data.games.length === 1 ? 'juego encontrado' : 'juegos encontrados'}{f.q ? ` para "${f.q}"` : ''}
		</p>
	</div>
</div>

<div class="grid gap-6 lg:grid-cols-[260px_1fr]">
	<!-- Filtros: funcionan sin JavaScript (GET), y se envían solos al cambiar -->
	<form method="get" class="card h-fit space-y-4 p-4 lg:sticky lg:top-20" role="search" aria-label="Filtros del catálogo">
		<div>
			<label class="label" for="q">Título</label>
			<input id="q" name="q" defaultValue={f.q} class="input" placeholder="Ej. Celeste" />
		</div>
		<div>
			<label class="label" for="platform">Consola</label>
			<select id="platform" name="platform" class="input" onchange={(e) => e.currentTarget.form.requestSubmit()}>
				<option value="">Todas</option>
				{#each data.facets.platforms as p (p)}<option value={p} selected={f.platform === p}>{p}</option>{/each}
			</select>
		</div>
		<div>
			<label class="label" for="genre">Género</label>
			<select id="genre" name="genre" class="input" onchange={(e) => e.currentTarget.form.requestSubmit()}>
				<option value="">Todos</option>
				{#each data.facets.genres as g (g)}<option value={g} selected={f.genre === g}>{g}</option>{/each}
			</select>
		</div>
		<div>
			<label class="label" for="year">Año de lanzamiento</label>
			<select id="year" name="year" class="input" onchange={(e) => e.currentTarget.form.requestSubmit()}>
				<option value="">Todos</option>
				{#each data.facets.years as y (y)}<option value={y} selected={String(f.year) === String(y)}>{y}</option>{/each}
			</select>
		</div>
		<div>
			<label class="label" for="sort">Ordenar por</label>
			<select id="sort" name="sort" class="input" onchange={(e) => e.currentTarget.form.requestSubmit()}>
				<option value="recent" selected={f.sort === 'recent'}>Reseñas recientes</option>
				<option value="score" selected={f.sort === 'score'}>Calificación TGR</option>
				<option value="title" selected={f.sort === 'title'}>Título (A–Z)</option>
				<option value="year" selected={f.sort === 'year'}>Año (más nuevo)</option>
			</select>
		</div>
		<div class="flex gap-2">
			<button class="btn-primary flex-1">Aplicar</button>
			{#if hasFilters}<a href="/juegos" class="btn-ghost">Limpiar</a>{/if}
		</div>
	</form>

	<section aria-label="Resultados">
		{#if data.games.length}
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
				{#each data.games as game (game.id)}
					<GameCard {game} />
				{/each}
			</div>
		{:else}
			<div class="card grid place-items-center p-12 text-center">
				<p class="font-display text-2xl font-bold">Sin resultados</p>
				<p class="mt-1 text-muted">No encontramos juegos con esos filtros. Prueba con otro título o quita algún filtro.</p>
				<a href="/juegos" class="btn-ghost mt-4">Ver todo el catálogo</a>
			</div>
		{/if}
	</section>
</div>
