<script>
	import { page } from '$app/state';
	let { data } = $props();
	const u = $derived(page.data.user);
	const fmt = (s) => new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
</script>

<svelte:head><title>Panel editor · TGR</title></svelte:head>

<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
	<div>
		<p class="text-xs font-semibold tracking-[0.2em] text-accent uppercase">Panel editor</p>
		<h1 class="text-3xl font-bold">{u.outlet ? `Reseñas de ${u.outlet}` : u.role === 'admin' ? 'Todas las reseñas' : 'Reseñas oficiales TGR'}</h1>
		<p class="text-sm text-muted">
			{u.outlet ? 'Las reseñas que publiques se promedian en la calificación de revistas.' : 'Cada juego sólo puede tener una reseña oficial de TGR.'}
		</p>
	</div>
	<form action="/editor/nueva" method="get" class="flex flex-wrap items-end gap-2">
		<div>
			<label for="juego" class="label">Nueva reseña para…</label>
			<select id="juego" name="juego" required class="input w-64">
				<option value="">Selecciona un juego</option>
				{#each data.available as g (g.id)}<option value={g.id}>{g.title}</option>{/each}
			</select>
		</div>
		<button class="btn-primary" disabled={!data.available.length}>Escribir</button>
	</form>
</div>

<div class="card overflow-x-auto">
	<table class="table">
		<thead>
			<tr><th>Juego</th><th>Título</th><th>Tipo</th><th>Calificación</th><th>Actualizada</th><th><span class="sr-only">Acciones</span></th></tr>
		</thead>
		<tbody>
			{#each data.reviews as r (r.id)}
				<tr>
					<td><a href="/juegos/{r.game_slug}" class="font-semibold">{r.game_title}</a></td>
					<td class="max-w-xs truncate">{r.title}</td>
					<td><span class="chip" style="border-color:{r.kind === 'official' ? 'var(--color-score-tgr)' : 'var(--color-score-press)'}">{r.kind === 'official' ? 'Oficial TGR' : r.outlet}</span></td>
					<td><span class="font-display font-bold">{r.score.toFixed(1)}</span><span class="text-xs text-muted"> /5 ({Number(r.score_raw)}/{Number(r.score_max)})</span></td>
					<td class="whitespace-nowrap text-muted">{fmt(r.updated_at)}</td>
					<td class="text-right"><a href="/editor/{r.id}" class="btn-ghost px-3 py-1">Editar</a></td>
				</tr>
			{:else}
				<tr><td colspan="6" class="py-8 text-center text-muted">Aún no hay reseñas. Elige un juego arriba para escribir la primera.</td></tr>
			{/each}
		</tbody>
	</table>
</div>
