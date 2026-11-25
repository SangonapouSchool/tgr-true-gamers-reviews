<script>
	import '../app.css';
	import { page } from '$app/state';
	import Logo from '#lib/components/Logo.svelte';
	import { can } from '#lib/permissions.js';

	let { data, children } = $props();
	let menuOpen = $state(false);
	let notifOpen = $state(false);
	// Cierra el menú de notificaciones al cambiar de página
	$effect(() => {
		page.url.pathname;
		notifOpen = false;
	});

	const links = $derived(
		[
			{ href: '/', label: 'Inicio' },
			{ href: '/juegos', label: 'Catálogo' },
			can(data.user, 'write_review') && { href: '/editor', label: 'Panel editor' },
			can(data.user, 'manage_users') && { href: '/admin', label: 'Administración' }
		].filter(Boolean)
	);
	const isActive = (href) => (href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href));
</script>

<a href="#contenido" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-primary focus:px-3 focus:py-2 focus:text-white">Saltar al contenido</a>

<header class="sticky top-0 z-40 border-b border-line bg-bg/85 backdrop-blur">
	<div class="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
		<a href="/" class="no-underline"><Logo /><span class="sr-only"> (ir al inicio)</span></a>

		<nav class="ml-6 hidden items-center gap-1 md:flex" aria-label="Principal">
			{#each links as l (l.href)}
				<a
					href={l.href}
					class="rounded-md px-3 py-2 font-display text-sm font-semibold tracking-wide no-underline transition {isActive(l.href)
						? 'bg-surface-2 text-fg shadow-[inset_0_-2px_0_var(--color-primary-soft)]'
						: 'text-muted hover:text-fg'}"
					aria-current={isActive(l.href) ? 'page' : undefined}>{l.label}</a
				>
			{/each}
		</nav>

		<form action="/juegos" method="get" class="ml-auto hidden lg:block" role="search">
			<label class="sr-only" for="q-top">Buscar videojuegos</label>
			<input id="q-top" name="q" class="input w-64 py-1.5 text-sm" placeholder="Buscar juego…" />
		</form>

		<div class="ml-auto flex items-center gap-2 lg:ml-0">
			{#if data.user}
				<a href="/perfil" class="flex items-center gap-2 rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-fg no-underline hover:border-primary-soft">
					<span class="grid size-7 place-items-center rounded-md bg-primary font-display font-bold text-white" aria-hidden="true">{data.user.username[0].toUpperCase()}</span>
					<span class="hidden sm:inline">{data.user.username}</span>
				</a>
				<!-- Campana con menú de notificaciones (hallazgos de la prueba de usabilidad) -->
				<div class="relative">
					<button
						class="btn-ghost relative px-2.5 {data.unread ? 'text-fg' : 'text-muted'}"
						aria-expanded={notifOpen}
						aria-controls="menu-notificaciones"
						onclick={() => (notifOpen = !notifOpen)}
					>
						<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
						{#if data.unread}
							<span class="absolute -top-1 -right-1 min-w-4 rounded-full bg-danger px-1 text-center text-[10px] leading-4 font-bold text-white" aria-hidden="true">{data.unread}</span>
						{/if}
						<span class="sr-only">Notificaciones{data.unread ? `: ${data.unread} sin leer` : ''}</span>
					</button>
					{#if notifOpen}
						<div id="menu-notificaciones" class="card absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] p-2 shadow-xl">
							<p class="px-2 py-1 font-display text-sm font-bold">Notificaciones</p>
							<ul class="max-h-80 space-y-1 overflow-y-auto">
								{#each data.latestNotifications as n (n.id)}
									<li class="rounded-md p-2 text-sm {n.read ? 'text-muted' : 'bg-primary/10 text-fg'}">
										{#if !n.read}<span class="sr-only">Nueva: </span>{/if}{n.message}
									</li>
								{:else}
									<li class="p-2 text-sm text-muted">No tienes notificaciones.</li>
								{/each}
							</ul>
							<a href="/perfil#notifs" onclick={() => (notifOpen = false)} class="mt-1 block rounded-md px-2 py-2 text-center text-sm font-semibold text-primary-soft hover:bg-surface-2">Ver todas las notificaciones</a>
						</div>
					{/if}
				</div>
				<form method="post" action="/logout"><button class="btn-ghost px-3">Salir</button></form>
			{:else}
				<a href="/login" class="btn-ghost">Entrar</a>
				<a href="/registro" class="btn-primary hidden sm:inline-flex">Crear cuenta</a>
			{/if}
			<button class="btn-ghost px-2 md:hidden" aria-expanded={menuOpen} aria-controls="menu-movil" onclick={() => (menuOpen = !menuOpen)}>
				<span class="sr-only">Menú</span>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
			</button>
		</div>
	</div>
	{#if menuOpen}
		<nav id="menu-movil" class="border-t border-line px-4 py-3 md:hidden" aria-label="Principal móvil">
			<form action="/juegos" method="get" class="mb-3" role="search">
				<label class="sr-only" for="q-mob">Buscar videojuegos</label>
				<input id="q-mob" name="q" class="input" placeholder="Buscar juego…" />
			</form>
			{#each links as l (l.href)}
				<a href={l.href} onclick={() => (menuOpen = false)} class="block rounded-md px-3 py-2 font-display font-semibold text-fg no-underline hover:bg-surface-2">{l.label}</a>
			{/each}
		</nav>
	{/if}
</header>

<main id="contenido" class="mx-auto min-h-[70vh] max-w-7xl px-4 py-8">
	{@render children()}
</main>

<footer class="border-t border-line">
	<div class="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-6 text-sm text-muted sm:flex-row sm:items-center">
		<Logo size={24} />
		<p>Reseñas transparentes e imparciales. Proyecto final · Diseño de Interfaces · Universidad Marista de Mérida</p>
	</div>
</footer>
