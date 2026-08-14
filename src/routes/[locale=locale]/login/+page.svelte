<script lang="ts">
	import { z } from 'zod';
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import AlertCircle from '@lucide/svelte/icons/alert-circle';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Container from '$lib/components/ui/Container.svelte';
	import Heading from '$lib/components/ui/Heading.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import { loginPayloadSchema } from '$lib/schemas';
	import { toPathname } from '$lib/utils/toPathname';
	import type { ActionData, PageData } from './$types';

	type ClientErrors = { email?: string; password?: string };

	function validate(email: string, password: string): ClientErrors {
		const result = loginPayloadSchema.safeParse({ email, password });
		if (result.success) {
			return {};
		}
		const fieldErrors = z.flattenError(result.error).fieldErrors;
		return { email: fieldErrors.email?.[0], password: fieldErrors.password?.[0] };
	}

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let email = $state('');
	let password = $state('');
	let touched = $state({ email: false, password: false });
	let submitting = $state(false);

	let clientErrors = $derived(validate(email, password));
	let emailError = $derived(
		(touched.email && clientErrors.email) || form?.errors?.email?.[0] || undefined,
	);
	let passwordError = $derived(
		(touched.password && clientErrors.password) || form?.errors?.password?.[0] || undefined,
	);
</script>

<svelte:head>
	<title>{data.translations.login.meta.title}</title>
	<meta name="description" content={data.translations.login.meta.description} />
	<meta name="robots" content="noindex" />
</svelte:head>

<Container size="sm" class="py-8">
	<a
		href={resolve(toPathname(`/${data.locale}`))}
		class="mx-auto mb-6 block w-fit rounded-sm text-center text-lg font-semibold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
	>
		Demo Co.
	</a>

	<Card class="mx-auto max-w-sm p-6 shadow-md">
		<Heading level={1} class="mb-6">{data.translations.login.title}</Heading>

		<form
			method="POST"
			novalidate
			use:enhance={() => {
				touched = { email: true, password: true };
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update();
				};
			}}
			class="flex flex-col gap-4"
		>
			{#if form?.message}
				<p role="alert" class="flex items-center gap-2 text-sm text-destructive">
					<AlertCircle class="h-4 w-4 shrink-0" aria-hidden="true" />
					{form.message}
				</p>
			{/if}

			<div class="flex flex-col gap-1.5">
				<label for="email" class="text-sm font-medium">{data.translations.login.email}</label>
				<Input
					id="email"
					name="email"
					type="email"
					autocomplete="email"
					bind:value={email}
					onblur={() => (touched = { ...touched, email: true })}
					error={!!emailError}
					aria-describedby={emailError ? 'email-error' : undefined}
				/>
				{#if emailError}
					<p id="email-error" class="text-sm text-destructive">{emailError}</p>
				{/if}
			</div>

			<div class="flex flex-col gap-1.5">
				<label for="password" class="text-sm font-medium">{data.translations.login.password}</label>
				<Input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					bind:value={password}
					onblur={() => (touched = { ...touched, password: true })}
					error={!!passwordError}
					aria-describedby={passwordError ? 'password-error' : undefined}
				/>
				{#if passwordError}
					<p id="password-error" class="text-sm text-destructive">{passwordError}</p>
				{/if}
			</div>

			<Button type="submit" disabled={submitting} class="mt-2">
				{submitting ? data.translations.common.loading : data.translations.login.submit}
			</Button>
		</form>
	</Card>
</Container>
