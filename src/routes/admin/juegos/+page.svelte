<script>
	import { enhance } from '$app/forms';
	import GameCover from '#lib/components/GameCover.svelte';
	import Alert from '#lib/components/Alert.svelte';
	let { data, form } = $props();
</script>

<svelte:head><title>Videojuegos · Administración · TGR</title></svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-3xl font-bold">Videojuegos</h1>
	<div class="flex gap-2">
		<form method="get" role="search">
			<label for="q" class="sr-only">Buscar</label>
			<input id="q" name="q" defaultValue={data.q} class="input w-56" placeholder="Buscar por título…" />
		</form>
		<a href="/admin/juegos/nuevo" class="btn-primary">+ Agregar juego</a>
	</div>
</div>

{#if form?.message}<div class="mb-4"><Alert kind="success">{form.message}</Alert></div>{/if}
{#if form?.error}<div class="mb-4"><Alert>{form.error}</Alert></div>{/if}

<div class="card overflow-x-auto">
	<table class="table">
		<thead><tr><th>Juego</th><th>Consola(s)</th><th>Género</th><th>Año</th><th>Reseñas</th><th><span class="sr-only">Acciones</span></th></tr></thead>
		<tbody>
			{#each data.games as g (g.id)}
				<tr>
					<td>
						<div class="flex items-center gap-3">
							<GameCover title={g.title} hue={g.cover_hue} image={g.cover_image} size="sm" class="w-9 shrink-0" />
							<a href="/juegos/{g.slug}" class="font-semibold">{g.title}</a>
						</div>
					</td>
					<td class="text-muted">{g.platforms.join(', ')}</td>
					<td>{g.genre}</td>
					<td>{g.year}</td>
					<td class="whitespace-nowrap">
						{#if g.scores.tgr != null}<span class="chip">Oficial ✓</span>{:else}<span class="chip text-warning">Sin oficial</span>{/if}
						<span class="text-xs text-muted">+{g.scores.pressCount} revistas</span>
					</td>
					<td>
						<div class="flex justify-end gap-2">
							<a href="/admin/juegos/{g.id}" class="btn-ghost px-3 py-1">Editar</a>
							<form method="post" action="?/delete" use:enhance={({ cancel }) => { if (!confirm(`¿Eliminar "${g.title}"? También se borrarán sus reseñas, calificaciones y comentarios.`)) cancel(); }}>
								<input type="hidden" name="id" value={g.id} />
								<button class="btn-danger px-3 py-1">Eliminar</button>
							</form>
						</div>
					</td>
				</tr>
			{:else}
				<tr><td colspan="6" class="py-8 text-center text-muted">No hay videojuegos con ese título.</td></tr>
			{/each}
		</tbody>
	</table>
</div>
