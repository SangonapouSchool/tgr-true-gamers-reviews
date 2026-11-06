<script>
	import { enhance } from '$app/forms';
	import Alert from '#lib/components/Alert.svelte';
	let { data, form } = $props();
	const fmt = (s) => new Date(s.replace(' ', 'T') + 'Z').toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' });
	const filters = [['all', 'Todos'], ['visible', 'Visibles'], ['hidden', 'Ocultos']];
</script>

<svelte:head><title>Moderación · TGR</title></svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-3xl font-bold">Moderación de comentarios</h1>
	<nav class="flex gap-1 rounded-lg border border-line bg-surface p-1" aria-label="Filtrar comentarios">
		{#each filters as [v, l] (v)}
			<a href="?filter={v}" aria-current={data.filter === v ? 'page' : undefined} class="rounded-md px-3 py-1 text-sm font-semibold no-underline {data.filter === v ? 'bg-surface-2 text-fg' : 'text-muted hover:text-fg'}">{l}</a>
		{/each}
	</nav>
</div>

{#if form?.message}<div class="mb-4"><Alert kind="success">{form.message}</Alert></div>{/if}
{#if form?.error}<div class="mb-4"><Alert>{form.error}</Alert></div>{/if}

<ul class="space-y-3">
	{#each data.comments as c (c.id)}
		<li class="card flex flex-wrap items-start gap-4 p-4 {c.hidden ? 'border-dashed opacity-75' : ''}">
			<div class="min-w-0 flex-1">
				<p class="text-sm">
					<span class="font-semibold">{c.username}</span> en <a href="/juegos/{c.game_slug}">{c.game_title}</a>
					<span class="text-xs text-muted">· {fmt(c.created_at)}</span>
					{#if c.hidden}<span class="chip ml-1 border-warning/60 text-warning">Oculto</span>{/if}
				</p>
				<p class="mt-1 text-fg/90">{c.body}</p>
			</div>
			<form method="post" action="?/moderate" class="flex gap-2" use:enhance={({ submitter, cancel }) => { if (submitter?.value === 'delete' && !confirm('¿Eliminar este comentario definitivamente?')) cancel(); }}>
				<input type="hidden" name="id" value={c.id} />
				{#if c.hidden}
					<button name="action" value="unhide" class="btn-ghost px-3 py-1">Restaurar</button>
				{:else}
					<button name="action" value="hide" class="btn-ghost px-3 py-1">Ocultar</button>
				{/if}
				<button name="action" value="delete" class="btn-danger px-3 py-1">Eliminar</button>
			</form>
		</li>
	{:else}
		<li class="card p-8 text-center text-muted">No hay comentarios en esta vista.</li>
	{/each}
</ul>
