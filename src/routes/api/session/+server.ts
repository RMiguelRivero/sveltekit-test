import type { RequestHandler } from './$types';

export const config = { runtime: 'edge' };

export const GET: RequestHandler = ({ locals }) => {
	return new Response(JSON.stringify({ authenticated: locals.user !== null }), {
		headers: {
			'content-type': 'application/json',
			'cache-control': 'no-store',
		},
	});
};
