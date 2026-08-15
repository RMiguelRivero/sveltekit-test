<script lang="ts">
	import type { LayoutData } from './$types';

	let { data }: { data: LayoutData } = $props();
</script>

<footer class="border-t border-border py-6 text-center text-sm text-muted-foreground">
	<p>{data.translations.footer.copy}</p>
</footer>
