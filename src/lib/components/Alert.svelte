<script>
	let { kind = 'error', children } = $props();
	const styles = {
		error: 'border-danger/50 bg-danger/10 text-[#ff9fb0]',
		success: 'border-success/50 bg-success/10 text-[#86efac]',
		info: 'border-accent/40 bg-accent/10 text-[#a5f3fc]'
	};
</script>

<div class="rounded-lg border px-4 py-3 text-sm {styles[kind]}" role={kind === 'error' ? 'alert' : 'status'}>
	{@render children()}
</div>
