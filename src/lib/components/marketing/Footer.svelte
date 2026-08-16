<script lang="ts">
	let { copy }: { copy: string } = $props();
</script>

<footer class="border-t border-border py-6 text-center text-sm text-muted-foreground">
	<p>{copy}</p>
</footer>
