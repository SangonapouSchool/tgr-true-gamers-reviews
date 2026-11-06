<script>
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import { ROLES, ROLE_LABELS } from '#lib/permissions.js';
	let { data, form } = $props();
	const me = $derived(page.data.user);
</script>

<svelte:head><title>Usuarios y roles · TGR</title></svelte:head>

<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-3xl font-bold">Usuarios y roles</h1>
	<form method="get" class="flex gap-2" role="search">
		<label for="q" class="sr-only">Buscar usuario</label>
		<input id="q" name="q" defaultValue={data.q} class="input w-52" placeholder="Usuario o correo…" />
		<label for="role-f" class="sr-only">Filtrar por rol</label>
		<select id="role-f" name="role" class="input w-44" onchange={(e) => e.currentTarget.form.requestSubmit()}>
			<option value="">Todos los roles</option>
			{#each ROLES as r (r)}<option value={r} selected={data.role === r}>{ROLE_LABELS[r]}</option>{/each}
		</select>
	</form>
</div>

{#if form?.message}<div class="mb-4"><Alert kind="success">{form.message}</Alert></div>{/if}
{#if form?.error}<div class="mb-4"><Alert>{form.error}</Alert></div>{/if}

<div class="card overflow-x-auto">
	<table class="table">
		<thead><tr><th>Usuario</th><th>Rol</th><th>Revista (editores)</th><th>Estado</th><th><span class="sr-only">Guardar</span></th></tr></thead>
		<tbody>
			{#each data.users as u (u.id)}
				<tr class={u.status === 'suspended' ? 'bg-danger/5' : ''}>
					<td>
						<p class="font-semibold">{u.username}</p>
						<p class="text-xs text-muted">{u.email} · {u.comments} {u.comments === 1 ? 'comentario' : 'comentarios'}</p>
					</td>
					{#if u.id === me.id}
						<td><span class="chip">{ROLE_LABELS[u.role]}</span></td><td class="text-muted">—</td><td><span class="chip">Activo</span></td>
						<td class="text-xs text-muted">Tu cuenta</td>
					{:else}
						<td>
							<label class="sr-only" for="role-{u.id}">Rol de {u.username}</label>
							<select id="role-{u.id}" name="role" form="f-{u.id}" class="input py-1 text-sm">
								{#each ROLES as r (r)}<option value={r} selected={u.role === r}>{ROLE_LABELS[r]}</option>{/each}
							</select>
						</td>
						<td>
							<label class="sr-only" for="outlet-{u.id}">Revista de {u.username}</label>
							<input id="outlet-{u.id}" name="outlet" form="f-{u.id}" defaultValue={u.outlet ?? ''} class="input py-1 text-sm" placeholder="Vacío = staff TGR" />
						</td>
						<td>
							<label class="sr-only" for="status-{u.id}">Estado de {u.username}</label>
							<select id="status-{u.id}" name="status" form="f-{u.id}" class="input py-1 text-sm {u.status === 'suspended' ? 'text-danger' : ''}">
								<option value="active" selected={u.status === 'active'}>Activo</option>
								<option value="suspended" selected={u.status === 'suspended'}>Suspendido</option>
							</select>
						</td>
						<td>
							<form id="f-{u.id}" method="post" action="?/update" use:enhance={() => async ({ update }) => update({ reset: false })}>
								<input type="hidden" name="id" value={u.id} />
								<button class="btn-ghost px-3 py-1">Guardar</button>
							</form>
						</td>
					{/if}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<p class="mt-3 text-xs text-muted">La revista sólo aplica a editores: si se indica, el editor publica reseñas de esa revista (RN4); si se deja vacío, publica reseñas oficiales de TGR.</p>
