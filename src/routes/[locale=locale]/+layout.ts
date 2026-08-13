import type { LayoutLoad } from './$types';
import { translations } from '$lib/i18n/constants';

export const load: LayoutLoad = async ({ params, data }) => {
	const locale = params.locale;

	return {
		...data,
		locale,
		translations: translations[locale],
	};
};
