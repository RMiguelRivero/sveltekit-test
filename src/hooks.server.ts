import { sequence } from '@sveltejs/kit/hooks';
import { handleRootRouteGuard } from '$lib/server/hooks/root-route-guard';
import { handleTranslations } from '$lib/server/hooks/translations';
import { handleAuth } from '$lib/server/hooks/auth';

export const handle = sequence(handleRootRouteGuard, handleTranslations, handleAuth);
