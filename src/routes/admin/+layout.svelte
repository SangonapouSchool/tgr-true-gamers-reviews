<script>
	import { page } from '$app/state';
	let { children } = $props();
	const tabs = [
		{ href: '/admin', label: 'Resumen', exact: true },
		{ href: '/admin/juegos', label: 'Videojuegos' },
		{ href: '/admin/usuarios', label: 'Usuarios y roles' },
		{ href: '/admin/comentarios', label: 'Moderación' }
	];
	const active = (t) => (t.exact ? page.url.pathname === t.href : page.url.pathname.startsWith(t.href));
</script>

<div class="grid gap-6 lg:grid-cols-[220px_1fr]">
	<aside>
		<p class="mb-2 text-xs font-semibold tracking-[0.2em] text-accent uppercase">Administración</p>
		<nav class="card flex gap-1 overflow-x-auto p-2 lg:flex-col" aria-label="Administración">
			{#each tabs as t (t.href)}
				<a
					href={t.href}
					aria-current={active(t) ? 'page' : undefined}
					class="rounded-md px-3 py-2 font-display text-sm font-semibold whitespace-nowrap no-underline {active(t)
						? 'bg-primary text-white'
						: 'text-muted hover:bg-surface-2 hover:text-fg'}">{t.label}</a
				>
			{/each}
		</nav>
	</aside>
	<div class="min-w-0">{@render children()}</div>
</div>
