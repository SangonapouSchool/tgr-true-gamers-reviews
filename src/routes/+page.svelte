<script>
	import GameCard from '#lib/components/GameCard.svelte';
	import GameCover from '#lib/components/GameCover.svelte';
	let { data } = $props();
</script>

<svelte:head>
	<title>TGR · True Gamers Reviews</title>
	<meta name="description" content="Reseñas de videojuegos transparentes: calificación oficial TGR, promedio de revistas y voto de la comunidad." />
</svelte:head>

<!-- Hero con búsqueda: el camino más corto a una reseña (RNF6: ≤ 3 clics) -->
<section class="hero relative -mx-4 -mt-8 mb-10 overflow-hidden border-b border-line px-4 py-14 sm:py-20">
	<div class="relative mx-auto max-w-3xl text-center">
		<p class="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-surface/80 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-accent uppercase">
			<span class="size-1.5 rounded-full bg-accent"></span> Reseñas sin letra chiquita
		</p>
		<h1 class="text-4xl leading-tight font-bold sm:text-5xl">
			Encuentra tu próximo juego.<br /><span class="gradient-text">Con tres opiniones, no una.</span>
		</h1>
		<p class="mx-auto mt-4 max-w-xl text-muted">
			Compara la calificación oficial de TGR, el promedio de revistas especializadas y el voto de la comunidad antes de decidir.
		</p>
		<form action="/juegos" method="get" class="mx-auto mt-8 flex max-w-xl gap-2" role="search">
			<label for="q-hero" class="sr-only">Buscar por título</label>
			<input id="q-hero" name="q" class="input py-3 text-base" placeholder="Busca por título: Hollow Knight, Hades…" autocomplete="off" />
			<button class="btn-primary px-6">Buscar</button>
		</form>
		<div class="mt-5 flex flex-wrap justify-center gap-2" aria-label="Explorar por consola">
			{#each data.facets.platforms as p (p)}
				<a href="/juegos?platform={encodeURIComponent(p)}" class="chip no-underline hover:border-primary-soft hover:text-fg">{p}</a>
			{/each}
		</div>
	</div>
</section>

<section aria-labelledby="leyenda" class="mb-12 grid gap-3 sm:grid-cols-3">
	<h2 id="leyenda" class="sr-only">Cómo leer nuestras calificaciones</h2>
	{#each [['TGR', 'Calificación oficial', 'Una reseña por juego escrita por el equipo de TGR.', 'var(--color-score-tgr)'], ['Revistas', 'Promedio de revistas', 'Revistas afiliadas, convertidas a escala de 5 estrellas.', 'var(--color-score-press)'], ['Comunidad', 'Voto de jugadores', 'Visible a partir de 5 calificaciones de usuarios.', 'var(--color-score-community)']] as [tag, t, d, c] (tag)}
		<div class="card flex gap-3 p-4" style="border-left:3px solid {c}">
			<span class="font-display text-sm font-bold tracking-wider uppercase" style="color:{c}">{tag}</span>
			<div>
				<p class="font-semibold">{t}</p>
				<p class="text-sm text-muted">{d}</p>
			</div>
		</div>
	{/each}
</section>

<div class="grid gap-10 lg:grid-cols-[1fr_320px]">
	<section aria-labelledby="recientes">
		<div class="mb-4 flex items-end justify-between">
			<h2 id="recientes" class="text-2xl font-bold">Reseñas recientes</h2>
			<a href="/juegos" class="text-sm font-semibold">Ver catálogo completo →</a>
		</div>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
			{#each data.recent as game (game.id)}
				<GameCard {game} />
			{/each}
		</div>
	</section>

	<aside aria-labelledby="top" class="card h-fit p-4">
		<h2 id="top" class="mb-3 text-lg font-bold">Top TGR</h2>
		<ol class="space-y-2">
			{#each data.top as g, i (g.id)}
				<li>
					<a href="/juegos/{g.slug}" class="flex items-center gap-3 rounded-lg p-1.5 text-fg no-underline hover:bg-surface-2">
						<span class="w-5 text-center font-display text-lg font-bold text-muted">{i + 1}</span>
						<GameCover title={g.title} hue={g.cover_hue} size="sm" class="w-10 shrink-0" />
						<span class="min-w-0 flex-1">
							<span class="line-clamp-1 text-sm font-semibold">{g.title}</span>
							<span class="text-xs text-muted">{g.genre} · {g.year}</span>
						</span>
						<span class="font-display font-bold text-score-tgr" title="Calificación oficial TGR">{g.scores.tgr?.toFixed(1)}</span>
					</a>
				</li>
			{/each}
		</ol>
		<dl class="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
			<div><dt class="text-xs text-muted">Juegos</dt><dd class="font-display text-xl font-bold">{data.stats.games}</dd></div>
			<div><dt class="text-xs text-muted">Reseñas</dt><dd class="font-display text-xl font-bold">{data.stats.reviews}</dd></div>
			<div><dt class="text-xs text-muted">Votos</dt><dd class="font-display text-xl font-bold">{data.stats.ratings}</dd></div>
		</dl>
	</aside>
</div>

<style>
	.hero {
		background:
			radial-gradient(50% 80% at 15% 0%, rgb(108 71 255 / 0.28), transparent 70%),
			radial-gradient(40% 70% at 90% 10%, rgb(34 211 238 / 0.16), transparent 70%),
			linear-gradient(var(--color-bg), var(--color-bg));
	}
	.hero::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image:
			linear-gradient(rgb(255 255 255 / 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgb(255 255 255 / 0.04) 1px, transparent 1px);
		background-size: 32px 32px;
		mask-image: radial-gradient(70% 70% at 50% 30%, black, transparent);
	}
	.gradient-text {
		background: linear-gradient(90deg, #a48bff, #22d3ee);
		-webkit-background-clip: text;
		background-clip: text;
		color: transparent;
	}
</style>
