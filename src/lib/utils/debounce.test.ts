import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce';

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('debounce', () => {
	it('does not call the wrapped function before the delay elapses', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 300);

		debounced();
		vi.advanceTimersByTime(299);

		expect(fn).not.toHaveBeenCalled();
	});

	it('calls the wrapped function once the delay elapses', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 300);

		debounced();
		vi.advanceTimersByTime(300);

		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('resets the timer on each call, collapsing rapid calls into one', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 300);

		debounced();
		vi.advanceTimersByTime(200);
		debounced();
		vi.advanceTimersByTime(200);
		debounced();
		vi.advanceTimersByTime(200);

		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(100);

		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('forwards the arguments from the most recent call', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 300);

		debounced('first');
		debounced('second');
		vi.advanceTimersByTime(300);

		expect(fn).toHaveBeenCalledExactlyOnceWith('second');
	});

	it('fires again for calls made after a previous debounce window resolved', () => {
		const fn = vi.fn();
		const debounced = debounce(fn, 300);

		debounced('first');
		vi.advanceTimersByTime(300);
		debounced('second');
		vi.advanceTimersByTime(300);

		expect(fn).toHaveBeenCalledTimes(2);
		expect(fn).toHaveBeenNthCalledWith(1, 'first');
		expect(fn).toHaveBeenNthCalledWith(2, 'second');
	});
});
