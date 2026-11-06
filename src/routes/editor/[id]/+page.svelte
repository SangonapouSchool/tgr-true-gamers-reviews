<script>
	import ReviewForm from '#lib/components/ReviewForm.svelte';
	let { data, form } = $props();
	const r = $derived(data.review);
</script>

<svelte:head><title>Editar reseña · {data.game.title} · TGR</title></svelte:head>

<div class="mx-auto max-w-4xl">
	<a href="/editor" class="text-sm">← Volver al panel</a>
	<div class="mt-2 mb-6 flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-3xl font-bold">Editar reseña</h1>
		<form method="post" action="?/delete" onsubmit={(e) => { if (!confirm('¿Eliminar esta reseña? Esta acción no se puede deshacer.')) e.preventDefault(); }}>
			<button class="btn-danger">Eliminar reseña</button>
		</form>
	</div>
	<ReviewForm
		action="?/save"
		game={data.game}
		review={form?.values ? { ...r, ...form.values } : r}
		error={form?.error}
		kindLabel={r.kind === 'official' ? 'Reseña oficial TGR' : `Revista: ${r.outlet}`}
		submitLabel="Guardar cambios"
	/>
</div>
