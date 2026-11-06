<script>
	let { size = 32 } = $props();
</script>

<span class="inline-flex items-center gap-2">
	<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
		<defs>
			<linearGradient id="tgr-g" x1="0" y1="0" x2="1" y2="1">
				<stop offset="0" stop-color="#7B5CFF" /><stop offset="1" stop-color="#22D3EE" />
			</linearGradient>
		</defs>
		<rect width="64" height="64" rx="14" fill="#141925" stroke="#2A3347" />
		<path d="M12 18h40l-6 8H36v24h-9V26H18z" fill="url(#tgr-g)" />
	</svg>
	<span class="font-display text-xl leading-none font-bold tracking-wider text-fg"
		>TGR<span class="ml-1.5 hidden text-xs font-medium tracking-[0.2em] text-muted sm:inline">TRUE GAMERS REVIEWS</span></span
	>
</span>
