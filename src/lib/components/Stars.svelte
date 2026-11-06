<script>
	/** Muestra una calificación de 0 a 5 con estrellas (decorativas; el texto accesible lo pone el padre). */
	let { value = 0, size = 16, color = 'currentColor' } = $props();
	const pct = $derived(Math.max(0, Math.min(100, (Number(value) / 5) * 100)));
	const path = 'M12 2.5l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.5l-6 3.3 1.3-6.7-5-4.6 6.8-.8z';
</script>

<span class="relative inline-flex" aria-hidden="true" style="height:{size}px">
	<span class="flex text-line">
		{#each Array(5) as _, i (i)}
			<svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
		{/each}
	</span>
	<span class="absolute inset-0 flex overflow-hidden" style="width:{pct}%;color:{color}">
		{#each Array(5) as _, i (i)}
			<svg class="shrink-0" width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d={path} /></svg>
		{/each}
	</span>
</span>
