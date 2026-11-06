<script>
	import { page } from '$app/state';
	import ReviewForm from '#lib/components/ReviewForm.svelte';
	let { data, form } = $props();
	const u = $derived(page.data.user);
</script>

<svelte:head><title>Nueva reseña · {data.game.title} · TGR</title></svelte:head>

<div class="mx-auto max-w-4xl">
	<a href="/editor" class="text-sm">← Volver al panel</a>
	<h1 class="mt-2 mb-6 text-3xl font-bold">Nueva reseña</h1>
	<ReviewForm game={data.game} review={form?.values ?? {}} error={form?.error} kindLabel={u.outlet ? `Revista: ${u.outlet}` : 'Reseña oficial TGR'} />
</div>
