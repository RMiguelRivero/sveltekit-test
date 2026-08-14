import { describe, expect, it } from 'vitest';
import { shouldSample } from './rum';

describe('shouldSample', () => {
	it('always samples when the sample rate is 1', () => {
		expect(shouldSample(1, () => 0.999)).toBe(true);
	});

	it('never samples when the sample rate is 0', () => {
		expect(shouldSample(0, () => 0)).toBe(false);
	});

	it('samples when the random draw falls below the sample rate', () => {
		expect(shouldSample(0.5, () => 0.4)).toBe(true);
	});

	it('does not sample when the random draw falls at or above the sample rate', () => {
		expect(shouldSample(0.5, () => 0.5)).toBe(false);
	});
});
