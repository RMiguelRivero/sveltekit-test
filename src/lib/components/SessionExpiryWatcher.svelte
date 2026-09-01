<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { addToast } from '$lib/components/ui/toasts.svelte';
	import { initSessionFocusCheck, isSessionActive } from '$lib/client/sessionCheck';
	import { broadcastSessionLogout, listenForSessionLogout } from '$lib/client/sessionBroadcast';
	import { toPathname } from '$lib/utils/toPathname';
	import type { Locale, Translation } from '$lib/i18n/constants';
	import type { SessionUser } from '$lib/server/auth/types';

	let {
		user,
		locale,
		translations,
	}: { user: SessionUser | null; locale: Locale; translations: Translation } = $props();

	function redirectToLogin(): void {
		const redirectTo = encodeURIComponent(window.location.pathname);
		goto(resolve(toPathname(`/${locale}/login?redirectTo=${redirectTo}`)));
	}

	function handleSessionExpired(): void {
		addToast(translations.common.sessionExpired, 'error');
		broadcastSessionLogout();
		redirectToLogin();
	}

	function handleRemoteLogout(): void {
		addToast(translations.common.sessionExpired, 'error');
		redirectToLogin();
	}

	$effect(() => {
		if (!user) {
			return;
		}
		const stopListening = listenForSessionLogout(handleRemoteLogout);
		const stopFocusCheck = initSessionFocusCheck({
			isSessionActive,
			onSessionExpired: handleSessionExpired,
		});
		return () => {
			stopListening();
			stopFocusCheck();
		};
	});
</script>
