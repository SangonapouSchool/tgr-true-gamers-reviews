<script>
	import { ROLE_LABELS } from '#lib/permissions.js';
	let { data } = $props();
	const s = $derived(data.stats);
	const tiles = $derived([
		{ label: 'Videojuegos', value: s.games, href: '/admin/juegos', note: `${s.gamesWithoutOfficial} sin reseña oficial` },
		{ label: 'Reseñas', value: s.reviews, href: '/editor', note: 'Oficiales y de revistas' },
		{ label: 'Usuarios', value: s.users, href: '/admin/usuarios', note: `${s.suspended} suspendidos` },
		{ label: 'Comentarios', value: s.comments, href: '/admin/comentarios', note: `${s.hiddenComments} ocultos` }
	]);
</script>

<svelte:head><title>Administración · TGR</title></svelte:head>

<h1 class="mb-6 text-3xl font-bold">Resumen</h1>

<div class="mb-8 grid grid-cols-2 gap-3 xl:grid-cols-4">
	{#each tiles as t (t.label)}
		<a href={t.href} class="card block p-4 text-fg no-underline hover:border-primary-soft">
			<p class="text-sm text-muted">{t.label}</p>
			<p class="font-display text-4xl font-bold">{t.value}</p>
			<p class="text-xs text-muted">{t.note}</p>
		</a>
	{/each}
</div>

<div class="grid gap-6 xl:grid-cols-2">
	<section class="card p-4" aria-labelledby="ult-com">
		<div class="mb-3 flex items-center justify-between">
			<h2 id="ult-com" class="text-lg font-bold">Comentarios recientes</h2>
			<a href="/admin/comentarios" class="text-sm">Moderar →</a>
		</div>
		<ul class="space-y-2 text-sm">
			{#each data.latestComments as c (c.id)}
				<li class="rounded-lg border border-line p-2 {c.hidden ? 'opacity-60' : ''}">
					<span class="font-semibold">{c.username}</span> en <a href="/juegos/{c.game_slug}">{c.game_title}</a>
					{#if c.hidden}<span class="chip ml-1">Oculto</span>{/if}
					<p class="line-clamp-1 text-muted">{c.body}</p>
				</li>
			{/each}
		</ul>
	</section>
	<section class="card p-4" aria-labelledby="ult-us">
		<div class="mb-3 flex items-center justify-between">
			<h2 id="ult-us" class="text-lg font-bold">Usuarios recientes</h2>
			<a href="/admin/usuarios" class="text-sm">Gestionar →</a>
		</div>
		<ul class="space-y-2 text-sm">
			{#each data.latestUsers as u (u.id)}
				<li class="flex items-center justify-between rounded-lg border border-line p-2">
					<span><span class="font-semibold">{u.username}</span> <span class="text-muted">· {u.email}</span></span>
					<span class="chip">{ROLE_LABELS[u.role]}</span>
				</li>
			{/each}
		</ul>
	</section>
</div>
