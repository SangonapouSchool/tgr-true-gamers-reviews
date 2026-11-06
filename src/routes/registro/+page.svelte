<script>
	import Alert from '#lib/components/Alert.svelte';
	import Logo from '#lib/components/Logo.svelte';
	import { MIN_PASSWORD } from '#lib/validation.js';
	let { form } = $props();
	let password = $state('');
	const strongEnough = $derived(password.length >= MIN_PASSWORD);
</script>

<svelte:head><title>Crear cuenta · TGR</title></svelte:head>

<section class="mx-auto max-w-md">
	<div class="card p-6 sm:p-8">
		<div class="mb-6 text-center"><Logo size={40} /></div>
		<h1 class="text-center text-2xl font-bold">Crear cuenta</h1>
		<p class="mb-6 text-center text-sm text-muted">Únete a la comunidad para calificar y comentar.</p>
		{#if form?.error}<div class="mb-4"><Alert>{form.error}</Alert></div>{/if}
		<form method="post" class="space-y-4">
			<div>
				<label for="username" class="label">Nombre de usuario</label>
				<input id="username" name="username" defaultValue={form?.values?.username ?? ''} required minlength="3" maxlength="20" pattern="[A-Za-z0-9_]+" autocomplete="username" class="input" aria-describedby="username-help" />
				<p id="username-help" class="mt-1 text-xs text-muted">3 a 20 caracteres: letras, números o guion bajo.</p>
			</div>
			<div>
				<label for="email" class="label">Correo electrónico</label>
				<input id="email" name="email" type="email" defaultValue={form?.values?.email ?? ''} required autocomplete="email" class="input" />
			</div>
			<div>
				<label for="password" class="label">Contraseña</label>
				<input id="password" name="password" type="password" bind:value={password} required minlength={MIN_PASSWORD} autocomplete="new-password" class="input" aria-describedby="pw-help" />
				<p id="pw-help" class="mt-1 text-xs {password && !strongEnough ? 'text-danger' : password ? 'text-success' : 'text-muted'}">
					{password && strongEnough ? '✓ ' : ''}Mínimo {MIN_PASSWORD} caracteres.
				</p>
			</div>
			<div>
				<label for="confirm" class="label">Confirmar contraseña</label>
				<input id="confirm" name="confirm" type="password" required minlength={MIN_PASSWORD} autocomplete="new-password" class="input" />
			</div>
			<button class="btn-primary w-full">Crear cuenta</button>
		</form>
		<p class="mt-6 text-center text-sm text-muted">¿Ya tienes cuenta? <a href="/login">Inicia sesión</a></p>
	</div>
</section>
