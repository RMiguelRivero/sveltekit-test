import { z } from 'zod';
import type { RequestHandler } from './$types';
import { beaconEventSchema } from '$lib/schemas';

// Node default runtime is fine here: this is a low-traffic, best-effort telemetry
// sink, not a globally-fetched or latency-sensitive read path like the OG-image route.

export const POST: RequestHandler = async ({ request }) => {
	const body: unknown = await request.json().catch(() => undefined);
	const result = beaconEventSchema.safeParse(body);

	if (!result.success) {
		return new Response(z.prettifyError(result.error), { status: 400 });
	}

	console.log('[beacon]', JSON.stringify(result.data));

	return new Response(null, { status: 204 });
};
