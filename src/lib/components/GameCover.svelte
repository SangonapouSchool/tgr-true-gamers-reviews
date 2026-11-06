<script>
	/**
	 * Portada generada a partir del título y un tono de color.
	 * Evita usar arte con derechos de autor y mantiene la identidad visual "gamer".
	 */
	let { title, hue = 260, size = 'md', class: klass = '' } = $props();
	const initials = $derived(
		title
			.replace(/[^\p{L}\p{N}\s]/gu, ' ')
			.split(/\s+/)
			.filter((w) => w.length > 2 || /\d/.test(w))
			.slice(0, 2)
			.map((w) => w[0].toUpperCase())
			.join('') || title.slice(0, 2).toUpperCase()
	);
</script>

<div
	class="cover relative isolate flex aspect-[3/4] items-end overflow-hidden rounded-lg {klass}"
	style="--h:{hue}"
	role="img"
	aria-label="Portada de {title}"
>
	<div class="grid-bg absolute inset-0 -z-10"></div>
	<span
		class="pointer-events-none absolute top-2 right-3 font-display font-bold text-white/15 {size === 'lg'
			? 'text-8xl'
			: size === 'sm'
				? 'text-3xl'
				: 'text-6xl'}">{initials}</span
	>
	<span
		class="relative z-10 m-3 line-clamp-3 font-display leading-tight font-bold text-white drop-shadow {size === 'lg'
			? 'text-2xl'
			: size === 'sm'
				? 'text-xs'
				: 'text-base'}">{title}</span
	>
</div>

<style>
	.cover {
		background:
			radial-gradient(120% 80% at 100% 0%, hsl(calc(var(--h) + 40) 90% 60% / 0.55), transparent 60%),
			linear-gradient(160deg, hsl(var(--h) 70% 32%), hsl(calc(var(--h) + 30) 60% 12%));
		box-shadow: inset 0 0 0 1px hsl(var(--h) 80% 70% / 0.25);
	}
	.grid-bg {
		background-image:
			linear-gradient(hsl(0 0% 100% / 0.06) 1px, transparent 1px),
			linear-gradient(90deg, hsl(0 0% 100% / 0.06) 1px, transparent 1px);
		background-size: 18px 18px;
		mask-image: linear-gradient(to top, black, transparent 85%);
	}
	.cover::after {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, rgb(0 0 0 / 0.65), transparent 55%);
	}
</style>
