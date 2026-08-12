import type { LayoutLoad } from './$types';
import { translations } from '$lib/i18n/constants';

export const load: LayoutLoad = async ({ params }) => {
	const locale = params.locale;

	return {
		locale,
		translations: translations[locale],
	};
};
