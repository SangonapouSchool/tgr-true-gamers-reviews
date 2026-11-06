<script>
	import { page } from '$app/state';
	import Alert from '#lib/components/Alert.svelte';
	import Logo from '#lib/components/Logo.svelte';
	let { form } = $props();
	const qs = $derived(page.url.search);
</script>

<svelte:head><title>Iniciar sesión · TGR</title></svelte:head>

<section class="mx-auto max-w-md">
	<div class="card p-6 sm:p-8">
		<div class="mb-6 text-center"><Logo size={40} /></div>
		<h1 class="text-center text-2xl font-bold">Iniciar sesión</h1>
		<p class="mb-6 text-center text-sm text-muted">Califica, comenta y guarda tus juegos favoritos.</p>
		{#if form?.error}<div class="mb-4"><Alert>{form.error}</Alert></div>{/if}
		<form method="post" class="space-y-4">
			<div>
				<label for="login" class="label">Correo o nombre de usuario</label>
				<input id="login" name="login" defaultValue={form?.login ?? ''} required autocomplete="username" class="input" />
			</div>
			<div>
				<label for="password" class="label">Contraseña</label>
				<input id="password" name="password" type="password" required autocomplete="current-password" class="input" />
			</div>
			<button class="btn-primary w-full">Entrar</button>
		</form>
		<p class="mt-6 text-center text-sm text-muted">¿No tienes cuenta? <a href="/registro{qs}">Regístrate gratis</a></p>
	</div>
</section>
