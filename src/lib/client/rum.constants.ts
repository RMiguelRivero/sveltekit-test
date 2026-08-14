export const BEACON_ENDPOINT = '/api/beacon';

// Sampled at 100% since this is a low-traffic demo app with negligible real
// production load; a real production app would drop this to ~0.05-0.2 to
// bound beacon volume/cost while still getting a representative signal.
export const RUM_SAMPLE_RATE = 1;
