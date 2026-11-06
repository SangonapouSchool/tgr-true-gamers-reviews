<script>
	import GameForm from '#lib/components/GameForm.svelte';
	let { data, form } = $props();
	const prev = $derived(form?.values ? { ...form.values, platforms: [].concat(form.values.platforms ?? []) } : {});
</script>

<svelte:head><title>Agregar videojuego · TGR</title></svelte:head>

<a href="/admin/juegos" class="text-sm">← Videojuegos</a>
<h1 class="mt-2 mb-6 text-3xl font-bold">Agregar videojuego</h1>
<GameForm game={prev} platforms={data.facets.platforms} genres={data.facets.genres} error={form?.error} submitLabel="Agregar juego" />
