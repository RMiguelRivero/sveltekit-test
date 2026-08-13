<script lang="ts">
	import Dialog from './Dialog.svelte';

	let open = $state(false);
</script>

<button onclick={() => (open = true)}>Open dialog</button>
<Dialog bind:open title="Test dialog" description="Test description">
	<input type="text" placeholder="first field" />
	<input type="text" placeholder="second field" />
	{#snippet footer()}
		<button onclick={() => (open = false)}>Confirm</button>
	{/snippet}
</Dialog>
