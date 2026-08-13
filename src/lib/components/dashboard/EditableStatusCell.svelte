<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import { itemSchema, itemStatusSchema, type Item, type ItemStatus } from '$lib/schemas';
	import { capitalize } from '$lib/utils/capitalize';
	import { STATUS_BADGE_VARIANT } from './items-display.constants';

	interface Props {
		item: Item;
		pending: boolean;
		editable: boolean;
		errorMessage: string;
		onOptimisticUpdate: (status: ItemStatus) => void;
		onReconcile: (item: Item) => void;
		onRollback: (status: ItemStatus) => void;
		onPendingChange: (pending: boolean) => void;
		onError: (message: string) => void;
	}

	let {
		item,
		pending,
		editable,
		errorMessage,
		onOptimisticUpdate,
		onReconcile,
		onRollback,
		onPendingChange,
		onError,
	}: Props = $props();

	const STATUS_OPTIONS = itemStatusSchema.options;

	// Captured synchronously before the optimistic mutation is applied, so the async
	// result handler below always has the pre-edit value to roll back to, independent
	// of whatever `item.status` becomes in the meantime.
	const handleSubmit: SubmitFunction = ({ formData, cancel, formElement }) => {
		const newStatus = formData.get('status') as ItemStatus;
		if (!editable || newStatus === item.status) {
			cancel();
			return;
		}

		const previousStatus = item.status;
		onOptimisticUpdate(newStatus);
		onPendingChange(true);

		return async ({ result }) => {
			onPendingChange(false);

			if (result.type === 'success') {
				const parsed = itemSchema.safeParse(result.data?.item);
				if (parsed.success) {
					onReconcile(parsed.data);
				}
				return;
			}

			onRollback(previousStatus);
			onError(errorMessage);
			formElement.querySelector('select')?.focus();
		};
	};
</script>

<div class="flex items-center gap-2">
	{#if editable}
		<form method="POST" action="?/updateStatus" use:enhance={handleSubmit}>
			<fieldset disabled={pending}>
				<input type="hidden" name="id" value={item.id} />
				<Select
					name="status"
					value={item.status}
					aria-busy={pending}
					aria-label={`Status for ${item.name}`}
					onchange={(event) => event.currentTarget.form?.requestSubmit()}
					class="w-32 text-xs"
				>
					{#each STATUS_OPTIONS as status (status)}
						<option value={status}>{capitalize(status)}</option>
					{/each}
				</Select>
			</fieldset>
		</form>
	{:else}
		<Badge variant={STATUS_BADGE_VARIANT[item.status]}>{capitalize(item.status)}</Badge>
	{/if}
	{#if pending}
		<span class="text-xs text-muted-foreground">Saving…</span>
	{/if}
</div>
