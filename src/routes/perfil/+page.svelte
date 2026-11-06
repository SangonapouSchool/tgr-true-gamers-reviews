<script>
	import { enhance } from '$app/forms';
	import GameCard from '#lib/components/GameCard.svelte';
	import Stars from '#lib/components/Stars.svelte';
	import Alert from '#lib/components/Alert.svelte';
	import { ROLE_LABELS } from '#lib/permissions.js';
	let { data } = $props();
	const u = $derived(data.user);
	const unread = $derived(data.notifications.filter((n) => !n.read).length);
	const fmt = (s) => new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
</script>

<svelte:head><title>Mi perfil · TGR</title></svelte:head>

<section class="card mb-8 flex flex-wrap items-center gap-4 p-5">
	<span class="grid size-16 place-items-center rounded-xl bg-primary font-display text-3xl font-bold text-white" aria-hidden="true">{u.username[0].toUpperCase()}</span>
	<div>
		<h1 class="text-2xl font-bold">{u.username}</h1>
		<p class="text-sm text-muted">{u.email} · {ROLE_LABELS[u.role]}{u.outlet ? ` (${u.outlet})` : ''}</p>
	</div>
	{#if u.status === 'suspended'}<span class="chip ml-auto border-danger/50 text-danger">Cuenta suspendida</span>{/if}
</section>

{#if u.status === 'suspended'}
	<div class="mb-6"><Alert kind="info">Tu cuenta está suspendida. Puedes seguir leyendo reseñas, pero no puedes calificar, comentar ni modificar tus favoritos.</Alert></div>
{/if}

<div class="grid gap-8 lg:grid-cols-[1fr_340px]">
	<div class="space-y-10">
		<section aria-labelledby="favs">
			<h2 id="favs" class="mb-4 text-xl font-bold">Mis favoritos <span class="text-muted">({data.favorites.length})</span></h2>
			{#if data.favorites.length}
				<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">{#each data.favorites as game (game.id)}<GameCard {game} />{/each}</div>
			{:else}
				<div class="card p-6 text-muted">Aún no guardas juegos. Usa el botón "Agregar a favoritos" en cualquier reseña. <a href="/juegos">Explorar catálogo</a></div>
			{/if}
		</section>

		<section aria-labelledby="mis-calif">
			<h2 id="mis-calif" class="mb-4 text-xl font-bold">Mis calificaciones</h2>
			{#if data.ratings.length}
				<ul class="card divide-y divide-line">
					{#each data.ratings as r (r.slug)}
						<li class="flex items-center gap-3 px-4 py-3">
							<a href="/juegos/{r.slug}" class="flex-1 font-semibold">{r.title}</a>
							<Stars value={r.stars} color="var(--color-score-community)" />
							<span class="sr-only">{r.stars} de 5</span>
						</li>
					{/each}
				</ul>
			{:else}
				<p class="text-muted">Todavía no calificas ningún juego.</p>
			{/if}
		</section>
	</div>

	<aside aria-labelledby="notifs" class="card h-fit p-4">
		<div class="mb-3 flex items-center justify-between">
			<h2 id="notifs" class="text-lg font-bold">Notificaciones</h2>
			{#if unread}
				<form method="post" action="?/read" use:enhance><button class="text-sm font-semibold text-primary-soft hover:underline">Marcar como leídas</button></form>
			{/if}
		</div>
		<ul class="space-y-2">
			{#each data.notifications as n (n.id)}
				<li class="rounded-lg border p-3 text-sm {n.read ? 'border-line text-muted' : 'border-primary-soft/50 bg-primary/10'}">
					{#if !n.read}<span class="sr-only">Nueva: </span>{/if}{n.message}
					<span class="mt-1 block text-xs text-muted">{fmt(n.created_at)}</span>
				</li>
			{:else}
				<li class="text-sm text-muted">No tienes notificaciones.</li>
			{/each}
		</ul>
	</aside>
</div>
