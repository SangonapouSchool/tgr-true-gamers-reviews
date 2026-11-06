<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import GameCover from '#lib/components/GameCover.svelte';
	import ScoreBadge from '#lib/components/ScoreBadge.svelte';
	import Stars from '#lib/components/Stars.svelte';
	import Alert from '#lib/components/Alert.svelte';

	let { data, form } = $props();
	const g = $derived(data.game);
	let showOutlets = $state(false);
	let hover = $state(0);

	const fmtDate = (s) => new Date(s.replace(' ', 'T') + 'Z').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
	const scaleLabel = (r) => `${Number(r.score_raw)}/${Number(r.score_max)}`;
	const loginHref = $derived(`/login?redirectTo=${encodeURIComponent(page.url.pathname)}`);
</script>

<svelte:head>
	<title>{g.title} · Reseña · TGR</title>
	<meta name="description" content={data.official?.verdict ?? g.synopsis} />
</svelte:head>

<nav aria-label="Ruta de navegación" class="mb-4 text-sm text-muted">
	<a href="/">Inicio</a> <span aria-hidden="true">/</span> <a href="/juegos">Catálogo</a> <span aria-hidden="true">/</span>
	<span aria-current="page" class="text-fg">{g.title}</span>
</nav>

<!-- Encabezado del juego -->
<section class="game-hero card relative mb-8 overflow-hidden p-5 sm:p-6" style="--h:{g.cover_hue}">
	<div class="relative grid gap-6 sm:grid-cols-[200px_1fr]">
		<GameCover title={g.title} hue={g.cover_hue} image={g.cover_image} size="lg" class="w-40 sm:w-full" />
		<div class="flex flex-col">
			<div class="flex flex-wrap gap-2">
				<span class="chip">{g.genre}</span>
				<span class="chip">{g.year}</span>
				{#each g.platforms as p (p)}<a href="/juegos?platform={encodeURIComponent(p)}" class="chip no-underline hover:text-fg">{p}</a>{/each}
			</div>
			<h1 class="mt-3 text-3xl leading-tight font-bold sm:text-4xl">{g.title}</h1>
			{#if g.developer}<p class="text-muted">Desarrollado por {g.developer}</p>{/if}
			{#if g.synopsis}<p class="mt-3 max-w-2xl text-fg/85">{g.synopsis}</p>{/if}

			<div class="mt-auto flex flex-wrap items-center gap-2 pt-5">
				{#if data.canParticipate}
					<form method="post" action="?/favorite" use:enhance>
						<button class={data.favorite ? 'btn-primary' : 'btn-ghost'} aria-pressed={data.favorite}>
							<svg width="16" height="16" viewBox="0 0 24 24" fill={data.favorite ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0112 6a5.5 5.5 0 019.5 6c-2.5 4.6-9.5 9-9.5 9z" /></svg>
							{data.favorite ? 'En favoritos' : 'Agregar a favoritos'}
						</button>
					</form>
				{:else if !page.data.user}
					<a href={loginHref} class="btn-ghost">Inicia sesión para guardar en favoritos</a>
				{/if}
				{#if data.canWriteOfficial && !data.official}
					<a href="/editor/nueva?juego={g.id}" class="btn-ghost">Escribir reseña oficial</a>
				{/if}
				{#if data.canWriteOutlet}
					<a href="/editor/nueva?juego={g.id}" class="btn-ghost">Reseñar como {page.data.user.outlet}</a>
				{/if}
			</div>
		</div>
	</div>
</section>

{#if form?.message}<div class="mb-6"><Alert kind="success">{form.message}</Alert></div>{/if}
{#if form?.error}<div class="mb-6"><Alert>{form.error}</Alert></div>{/if}

<!-- Las tres calificaciones independientes (RF6) -->
<section aria-labelledby="calificaciones" class="mb-10">
	<h2 id="calificaciones" class="mb-3 text-xl font-bold">Calificaciones</h2>
	<div class="grid gap-3 sm:grid-cols-3">
		<ScoreBadge kind="tgr" value={g.scores.tgr} />
		<div class="flex flex-col">
			<ScoreBadge kind="press" value={g.scores.press} count={g.scores.pressCount} />
			{#if data.outlets.length}
				<button class="mt-2 self-start text-sm font-semibold text-primary-soft hover:underline" aria-expanded={showOutlets} aria-controls="desglose" onclick={() => (showOutlets = !showOutlets)}>
					{showOutlets ? 'Ocultar' : 'Ver'} desglose por revista ({data.outlets.length})
				</button>
			{/if}
		</div>
		<ScoreBadge kind="community" value={g.scores.community} count={g.scores.communityCount} sufficient={g.scores.communitySufficient} />
	</div>

	<!-- RN5: desglose de reseñas individuales por revista -->
	{#if showOutlets}
		<ul id="desglose" class="mt-4 grid gap-3 md:grid-cols-2">
			{#each data.outlets as r (r.id)}
				<li class="card p-4" style="border-left:3px solid var(--color-score-press)">
					<div class="flex items-center justify-between gap-2">
						<p class="font-display font-bold">{r.outlet}</p>
						<p class="text-right">
							<span class="font-display text-xl font-bold text-score-press">{r.score.toFixed(1)}</span><span class="text-sm text-muted">/5</span>
							<span class="block text-xs text-muted">Original: {scaleLabel(r)}</span>
						</p>
					</div>
					<p class="mt-2 text-sm text-fg/85">{r.body}</p>
					<p class="mt-2 text-xs text-muted">{fmtDate(r.published_at)}</p>
				</li>
			{/each}
		</ul>
	{/if}
</section>

<div class="grid gap-10 lg:grid-cols-[1fr_340px]">
	<div class="min-w-0">
		<!-- Reseña oficial (HU03) -->
		<article aria-labelledby="resena" class="mb-10">
			{#if data.official}
				{@const r = data.official}
				<p class="text-xs font-semibold tracking-[0.2em] text-score-tgr uppercase">Reseña oficial TGR</p>
				<h2 id="resena" class="mt-1 text-3xl font-bold">{r.title}</h2>
				<p class="mt-1 text-sm text-muted">Por {r.author ?? 'Equipo TGR'} · {fmtDate(r.published_at)}</p>

				{#if r.image}
					<img src={r.image} alt={r.image_alt} class="mt-5 w-full rounded-xl border border-line object-cover" loading="lazy" />
				{/if}

				<div class="prose-tgr mt-5">{@html r.html}</div>

				<div class="mt-6 grid gap-4 sm:grid-cols-2">
					<div class="card p-4" style="border-top:3px solid var(--color-success)">
						<h3 class="mb-2 flex items-center gap-2 font-bold"><span class="text-success" aria-hidden="true">＋</span> Lo bueno (pros)</h3>
						<ul class="space-y-1 text-sm">{#each r.pros as p (p)}<li class="flex gap-2"><span class="text-success" aria-hidden="true">▸</span>{p}</li>{/each}</ul>
					</div>
					<div class="card p-4" style="border-top:3px solid var(--color-danger)">
						<h3 class="mb-2 flex items-center gap-2 font-bold"><span class="text-danger" aria-hidden="true">－</span> Lo malo (contras)</h3>
						<ul class="space-y-1 text-sm">{#each r.cons as c (c)}<li class="flex gap-2"><span class="text-danger" aria-hidden="true">▸</span>{c}</li>{/each}</ul>
					</div>
				</div>

				<div class="verdict mt-6 rounded-xl border border-primary-soft/40 p-5">
					<div class="flex flex-wrap items-center gap-4">
						<div class="grid size-20 shrink-0 place-items-center rounded-xl bg-primary font-display text-3xl font-bold text-white" aria-hidden="true">{r.score.toFixed(1)}</div>
						<div class="min-w-0 flex-1">
							<h3 class="text-sm font-bold tracking-[0.2em] text-primary-soft uppercase">Veredicto</h3>
							<p class="mt-1 text-lg font-semibold">{r.verdict}</p>
							<p class="sr-only">Calificación oficial TGR: {r.score.toFixed(1)} de 5</p>
						</div>
					</div>
				</div>
			{:else}
				<h2 id="resena" class="text-2xl font-bold">Reseña oficial</h2>
				<div class="card mt-3 p-6 text-muted">El equipo de TGR aún no publica la reseña oficial de este juego. Mientras tanto, revisa lo que dicen las revistas y la comunidad.</div>
			{/if}
		</article>

		<!-- Comentarios (RF8) -->
		<section aria-labelledby="comentarios">
			<h2 id="comentarios" class="mb-4 text-2xl font-bold">Comentarios <span class="text-muted">({data.comments.length})</span></h2>
			{#if data.canParticipate}
				<form method="post" action="?/comment" use:enhance class="card mb-6 p-4">
					<label for="body" class="label">Comparte tu experiencia con este juego</label>
					<textarea id="body" name="body" rows="3" maxlength="1000" required class="input" placeholder="Escribe tu comentario…"></textarea>
					<div class="mt-3 flex justify-end"><button class="btn-primary">Publicar comentario</button></div>
				</form>
			{:else if page.data.user}
				<div class="mb-6"><Alert kind="info">Tu cuenta está suspendida: puedes leer reseñas, pero no comentar, calificar ni modificar favoritos.</Alert></div>
			{:else}
				<div class="card mb-6 p-4 text-sm text-muted"><a href={loginHref}>Inicia sesión</a> o <a href="/registro">crea una cuenta</a> para comentar.</div>
			{/if}
			<ul class="space-y-3">
				{#each data.comments as c (c.id)}
					<li class="card p-4">
						<div class="mb-1 flex items-center gap-2 text-sm">
							<span class="grid size-7 place-items-center rounded-md bg-surface-2 font-display font-bold text-primary-soft" aria-hidden="true">{c.username[0].toUpperCase()}</span>
							<span class="font-semibold">{c.username}</span>
							{#if c.role !== 'user'}<span class="chip">{c.role === 'admin' ? 'Admin' : (c.outlet ?? 'Editor TGR')}</span>{/if}
							<span class="ml-auto text-xs text-muted">{fmtDate(c.created_at)}</span>
						</div>
						<p class="text-fg/90">{c.body}</p>
					</li>
				{:else}
					<li class="text-muted">Nadie ha comentado todavía. ¡Sé el primero!</li>
				{/each}
			</ul>
		</section>
	</div>

	<!-- Calificar (RF7) -->
	<aside class="space-y-4">
		<section class="card p-5 lg:sticky lg:top-20" aria-labelledby="calificar">
			<h2 id="calificar" class="text-lg font-bold">Tu calificación</h2>
			{#if data.canParticipate}
				<p class="mb-3 text-sm text-muted">{data.myRating ? `Calificaste este juego con ${data.myRating}/5. Puedes cambiarla cuando quieras.` : 'Tu voto cuenta para el promedio de la comunidad.'}</p>
				<form method="post" action="?/rate" use:enhance>
					<fieldset>
						<legend class="sr-only">Selecciona de 1 a 5 estrellas</legend>
						<div class="flex gap-1" role="radiogroup" onmouseleave={() => (hover = 0)}>
							{#each [1, 2, 3, 4, 5] as n (n)}
								<label class="cursor-pointer" onmouseenter={() => (hover = n)}>
									<input type="radio" name="stars" value={n} class="peer sr-only" defaultChecked={data.myRating === n} required />
									<span class="sr-only">{n} {n === 1 ? 'estrella' : 'estrellas'}</span>
									<svg width="36" height="36" viewBox="0 0 24 24" aria-hidden="true" class="rounded transition peer-focus-visible:outline-2 peer-focus-visible:outline-accent {n <= (hover || data.myRating || 0) ? 'text-score-community' : 'text-line'}" fill="currentColor"><path d="M12 2.5l2.9 6.2 6.8.8-5 4.6 1.3 6.7L12 17.5l-6 3.3 1.3-6.7-5-4.6 6.8-.8z" /></svg>
								</label>
							{/each}
						</div>
					</fieldset>
					<button class="btn-primary mt-4 w-full">{data.myRating ? 'Actualizar calificación' : 'Enviar calificación'}</button>
				</form>
			{:else if page.data.user}
				<p class="text-sm text-muted">Las cuentas suspendidas no pueden calificar.</p>
			{:else}
				<p class="mb-3 text-sm text-muted">Inicia sesión para calificar este juego.</p>
				<a href={loginHref} class="btn-primary w-full">Iniciar sesión</a>
			{/if}
			<div class="mt-5 border-t border-line pt-4 text-sm">
				<p class="mb-1 text-muted">Comunidad</p>
				{#if g.scores.communitySufficient}
					<div class="flex items-center gap-2"><Stars value={g.scores.community} color="var(--color-score-community)" /><span class="font-semibold">{g.scores.community.toFixed(1)}</span><span class="text-muted">({g.scores.communityCount} votos)</span></div>
				{:else}
					<p>Calificaciones insuficientes <span class="text-muted">({g.scores.communityCount}/5)</span></p>
				{/if}
			</div>
		</section>
	</aside>
</div>

<style>
	.game-hero::before {
		content: '';
		position: absolute;
		inset: 0;
		background: radial-gradient(60% 120% at 0% 0%, hsl(var(--h) 80% 50% / 0.22), transparent 70%);
	}
	.verdict {
		background: linear-gradient(120deg, rgb(108 71 255 / 0.18), rgb(34 211 238 / 0.06));
	}
</style>
