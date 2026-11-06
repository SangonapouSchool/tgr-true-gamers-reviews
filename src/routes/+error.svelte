<script>
	import { page } from '$app/state';
</script>

<svelte:head><title>Error {page.status} · TGR</title></svelte:head>

<section class="mx-auto max-w-lg py-16 text-center">
	<p class="font-display text-7xl font-bold text-primary-soft">{page.status}</p>
	<h1 class="mt-2 text-2xl font-bold">{page.status === 404 ? 'Game over: página no encontrada' : 'Algo salió mal'}</h1>
	<p class="mt-2 text-muted">{page.error?.message}</p>
	<a href="/" class="btn-primary mt-6">Volver al inicio</a>
</section>
