import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ params, data }) => {
	return {
		...data,
		locale: params.locale,
	};
};
