import { describe, expect, it } from 'vitest';
import { capitalize } from './capitalize';

describe('capitalize', () => {
	it('uppercases the first letter of a lowercase word', () => {
		expect(capitalize('hello')).toBe('Hello');
	});

	it('leaves an already-capitalized word unchanged', () => {
		expect(capitalize('Hello')).toBe('Hello');
	});

	it('only affects the first character, leaving the rest as-is', () => {
		expect(capitalize('hELLO')).toBe('HELLO');
	});

	it('handles a single-character string', () => {
		expect(capitalize('a')).toBe('A');
	});

	it('returns an empty string unchanged', () => {
		expect(capitalize('')).toBe('');
	});
});
