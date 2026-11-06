<script>
	import GameForm from '#lib/components/GameForm.svelte';
	let { data, form } = $props();
</script>

<svelte:head><title>Editar {data.game.title} · TGR</title></svelte:head>

<a href="/admin/juegos" class="text-sm">← Videojuegos</a>
<h1 class="mt-2 mb-6 text-3xl font-bold">Editar videojuego</h1>
{#key data.game.id}
	<GameForm game={data.game} platforms={data.facets.platforms} genres={data.facets.genres} error={form?.error} submitLabel="Guardar cambios" />
{/key}
