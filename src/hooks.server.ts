import { sequence } from '@sveltejs/kit/hooks';
import { handleTranslations } from '$lib/server/hooks/translations';
import { handleLocale } from '$lib/server/hooks/locale';
import { handleAuth } from '$lib/server/hooks/auth';

export const handle = sequence(handleTranslations, handleLocale, handleAuth);
