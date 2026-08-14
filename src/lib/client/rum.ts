import {
	onCLS,
	onINP,
	onLCP,
	onTTFB,
	type CLSMetric,
	type INPMetric,
	type LCPMetric,
	type TTFBMetric,
} from 'web-vitals';
import type { BeaconEvent } from '$lib/schemas';
import { BEACON_ENDPOINT } from './rum.constants';

type TrackedMetric = LCPMetric | INPMetric | CLSMetric | TTFBMetric;

export function shouldSample(sampleRate: number, random: () => number = Math.random): boolean {
	return random() < sampleRate;
}

export function send(event: BeaconEvent): void {
	const payload = JSON.stringify(event);

	if (navigator.sendBeacon(BEACON_ENDPOINT, payload)) {
		return;
	}

	void fetch(BEACON_ENDPOINT, { method: 'POST', body: payload, keepalive: true }).catch(
		() => undefined,
	);
}

function toWebVitalEvent(metric: TrackedMetric): BeaconEvent {
	return {
		type: 'web-vital',
		name: metric.name,
		value: metric.value,
		id: metric.id,
		rating: metric.rating,
		path: location.pathname,
	};
}

export function initWebVitals(options: {
	sampleRate: number;
	send?: (event: BeaconEvent) => void;
	random?: () => number;
}): void {
	if (!shouldSample(options.sampleRate, options.random)) {
		return;
	}

	const sendEvent = options.send ?? send;
	const reportMetric = (metric: TrackedMetric): void => sendEvent(toWebVitalEvent(metric));

	onLCP(reportMetric);
	onINP(reportMetric);
	onCLS(reportMetric);
	onTTFB(reportMetric);
}
