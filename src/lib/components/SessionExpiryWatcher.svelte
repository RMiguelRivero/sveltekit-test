<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { addToast } from '$lib/components/ui/toasts.svelte';
	import { initSessionFocusCheck, isSessionActive } from '$lib/client/sessionCheck';
	import { toPathname } from '$lib/utils/toPathname';
	import type { Locale, Translation } from '$lib/i18n/constants';
	import type { SessionUser } from '$lib/server/auth/types';

	let {
		user,
		locale,
		translations,
	}: { user: SessionUser | null; locale: Locale; translations: Translation } = $props();

	function handleSessionExpired() {
		addToast(translations.common.sessionExpired, 'error');
		const redirectTo = encodeURIComponent(window.location.pathname);
		goto(resolve(toPathname(`/${locale}/login?redirectTo=${redirectTo}`)));
	}

	$effect(() => {
		if (!user) {
			return;
		}
		return initSessionFocusCheck({ isSessionActive, onSessionExpired: handleSessionExpired });
	});
</script>
