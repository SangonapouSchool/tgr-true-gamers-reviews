<script>
	/**
	 * Una de las tres calificaciones independientes (RF6).
	 * Siempre va acompañada de una etiqueta de texto, no sólo color (RNF4).
	 */
	import Stars from './Stars.svelte';
	let { kind, value = null, count = 0, sufficient = true, compact = false } = $props();

	const META = {
		tgr: {
			label: 'TGR',
			long: 'Calificación oficial TGR',
			color: 'var(--color-score-tgr)',
			icon: 'M12 2l9 4v6c0 5-3.8 9.4-9 10-5.2-.6-9-5-9-10V6z'
		},
		press: {
			label: 'Revistas',
			long: 'Promedio de revistas',
			color: 'var(--color-score-press)',
			icon: 'M4 4h12v16H6a2 2 0 01-2-2zm12 4h4v10a2 2 0 01-2 2h-2M7 8h6M7 12h6M7 16h4'
		},
		community: {
			label: 'Comunidad',
			long: 'Promedio de la comunidad',
			color: 'var(--color-score-community)',
			icon: 'M9 11a3 3 0 100-6 3 3 0 000 6zm7 0a3 3 0 100-6M3 20v-1c0-2.5 3-4 6-4s6 1.5 6 4v1m2-5c2.5 0 4 1.5 4 4v1'
		}
	};
	const m = $derived(META[kind]);
	const sub = $derived(
		kind === 'press'
			? `${count} ${count === 1 ? 'reseña' : 'reseñas'}`
			: kind === 'community'
				? `${count} ${count === 1 ? 'voto' : 'votos'}`
				: 'Reseña oficial'
	);
</script>

{#if compact}
	<div
		class="flex min-w-0 flex-col items-center rounded-md border border-line bg-bg/60 px-1 py-1"
		style="border-top:2px solid {m.color}"
	>
		<span class="text-[10px] font-semibold tracking-wider text-muted uppercase">{m.label}</span>
		{#if value != null}
			<span class="font-display text-base leading-tight font-bold" style="color:{m.color}">{value.toFixed(1)}</span>
		{:else}
			<span
				class="font-display text-base leading-tight font-bold text-muted"
				title={kind === 'community' && !sufficient ? 'Calificaciones insuficientes' : 'Sin calificación'}>—</span
			>
		{/if}
	</div>
{:else}
	<div class="card relative overflow-hidden p-4" style="border-top:3px solid {m.color}">
		<div class="mb-2 flex items-center gap-2">
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={m.color} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d={m.icon} /></svg>
			<h3 class="text-sm font-semibold tracking-wider uppercase">{m.long}</h3>
		</div>
		{#if value != null}
			<p class="flex items-baseline gap-2">
				<span class="font-display text-4xl font-bold" style="color:{m.color}">{value.toFixed(1)}</span>
				<span class="text-muted">/ 5</span>
				<span class="sr-only">{m.long}: {value.toFixed(1)} de 5 estrellas</span>
			</p>
			<Stars {value} color={m.color} />
			<p class="mt-1 text-xs text-muted">{sub}</p>
		{:else if kind === 'community' && !sufficient}
			<p class="font-display text-lg font-semibold text-muted">Calificaciones insuficientes</p>
			<p class="mt-1 text-xs text-muted">Se necesitan al menos 5 votos ({count} de 5)</p>
		{:else}
			<p class="font-display text-lg font-semibold text-muted">Sin calificación</p>
			<p class="mt-1 text-xs text-muted">{kind === 'tgr' ? 'Reseña oficial pendiente' : 'Aún no hay reseñas de revistas'}</p>
		{/if}
	</div>
{/if}
