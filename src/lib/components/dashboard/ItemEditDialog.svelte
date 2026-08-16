<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/state';
	import type { SubmitFunction } from '@sveltejs/kit';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import {
		itemSchema,
		itemChannelSchema,
		itemStatusSchema,
		type Item,
		type ItemChannel,
		type ItemStatus,
	} from '$lib/schemas';
	import { capitalize } from '$lib/utils/capitalize';
	import { formatChannelLabel } from '$lib/utils/formatChannelLabel';

	type ItemEditableFields = Pick<Item, 'name' | 'status' | 'channel' | 'budget' | 'spent' | 'ctr'>;

	interface Props {
		item: Item;
		pending: boolean;
		onOptimisticUpdate: (patch: ItemEditableFields) => void;
		onReconcile: (item: Item) => void;
		onRollback: (patch: ItemEditableFields) => void;
		onPendingChange: (pending: boolean) => void;
		onError: (message: string) => void;
	}

	let {
		item,
		pending,
		onOptimisticUpdate,
		onReconcile,
		onRollback,
		onPendingChange,
		onError,
	}: Props = $props();

	const STATUS_OPTIONS = itemStatusSchema.options;
	const CHANNEL_OPTIONS = itemChannelSchema.options;

	let open = $state(false);
	const formId = $props.id();

	function readEditableFields(formData: FormData): ItemEditableFields {
		return {
			name: String(formData.get('name')),
			status: formData.get('status') as ItemStatus,
			channel: formData.get('channel') as ItemChannel,
			budget: Number(formData.get('budget')),
			spent: Number(formData.get('spent')),
			ctr: Number(formData.get('ctr')),
		};
	}

	function currentFields(): ItemEditableFields {
		return {
			name: item.name,
			status: item.status,
			channel: item.channel,
			budget: item.budget,
			spent: item.spent,
			ctr: item.ctr,
		};
	}

	// Closes the dialog and applies the patch immediately, mirroring
	// EditableStatusCell's optimistic pattern (see items/+page.svelte's applyRowPatch) —
	// on failure the row rolls back and a toast fires, but the dialog is not reopened.
	const handleSubmit: SubmitFunction = ({ formData }) => {
		const previousFields = currentFields();

		onOptimisticUpdate(readEditableFields(formData));
		onPendingChange(true);
		open = false;

		return async ({ result }) => {
			onPendingChange(false);

			if (result.type === 'success') {
				const parsed = itemSchema.safeParse(result.data?.item);
				if (parsed.success) {
					onReconcile(parsed.data);
				}
				return;
			}

			onRollback(previousFields);
			const message =
				result.type === 'failure' && typeof result.data?.message === 'string'
					? result.data.message
					: page.data.translations.common.error.generic;
			onError(message);
		};
	};
</script>

<Button
	type="button"
	variant="ghost"
	size="icon"
	disabled={pending}
	aria-busy={pending}
	aria-label={page.data.translations.dashboard.items.edit.trigger.replace('{name}', item.name)}
	onclick={() => (open = true)}
>
	{#if pending}
		<LoaderCircle class="h-4 w-4 animate-spin" aria-hidden="true" />
	{:else}
		<Pencil class="h-4 w-4" aria-hidden="true" />
	{/if}
</Button>

<Dialog
	bind:open
	title={page.data.translations.dashboard.items.edit.title.replace('{name}', item.name)}
>
	<form
		id={formId}
		method="POST"
		action="?/updateItem"
		use:enhance={handleSubmit}
		class="flex flex-col gap-4"
	>
		<input type="hidden" name="id" value={item.id} />

		<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="{formId}-name">
			{page.data.translations.dashboard.items.column.name}
			<Input id="{formId}-name" name="name" value={item.name} required />
		</label>

		<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="{formId}-status">
			{page.data.translations.dashboard.items.column.status}
			<Select id="{formId}-status" name="status" value={item.status}>
				{#each STATUS_OPTIONS as status (status)}
					<option value={status}>{capitalize(status)}</option>
				{/each}
			</Select>
		</label>

		<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="{formId}-channel">
			{page.data.translations.dashboard.items.column.channel}
			<Select id="{formId}-channel" name="channel" value={item.channel}>
				{#each CHANNEL_OPTIONS as channel (channel)}
					<option value={channel}>{formatChannelLabel(channel)}</option>
				{/each}
			</Select>
		</label>

		<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="{formId}-budget">
			{page.data.translations.dashboard.items.column.budget}
			<Input
				id="{formId}-budget"
				name="budget"
				type="number"
				min="0"
				step="any"
				value={item.budget}
				required
			/>
		</label>

		<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="{formId}-spent">
			{page.data.translations.dashboard.items.column.spent}
			<Input
				id="{formId}-spent"
				name="spent"
				type="number"
				min="0"
				step="any"
				value={item.spent}
				required
			/>
		</label>

		<label class="flex flex-col gap-1 text-sm font-medium text-foreground" for="{formId}-ctr">
			{page.data.translations.dashboard.items.column.ctr}
			<Input
				id="{formId}-ctr"
				name="ctr"
				type="number"
				min="0"
				max="1"
				step="any"
				value={item.ctr}
				required
			/>
			<span class="text-xs text-muted-foreground">
				{page.data.translations.dashboard.items.edit.field.ctrHint}
			</span>
		</label>
	</form>

	{#snippet footer()}
		<Button type="button" variant="outline" onclick={() => (open = false)}>
			{page.data.translations.common.cancel}
		</Button>
		<Button type="submit" form={formId}>
			{page.data.translations.common.save}
		</Button>
	{/snippet}
</Dialog>
