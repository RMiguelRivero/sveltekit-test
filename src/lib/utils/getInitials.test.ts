import { describe, expect, it } from 'vitest';
import { getInitials } from './getInitials';

describe('getInitials', () => {
	it('returns the first letter of each of the first two words, uppercased', () => {
		expect(getInitials('emma wilson')).toBe('EW');
	});

	it('uppercases initials from already-capitalized names', () => {
		expect(getInitials('Ryan Mitchell')).toBe('RM');
	});

	it('returns a single initial for a one-word name', () => {
		expect(getInitials('Cher')).toBe('C');
	});

	it('ignores extra whitespace between and around words', () => {
		expect(getInitials('  Nina   Patel  ')).toBe('NP');
	});

	it('returns an empty string for an empty name', () => {
		expect(getInitials('')).toBe('');
	});

	it('only uses the first two words of a longer name', () => {
		expect(getInitials('Mary Jane Watson')).toBe('MJ');
	});
});
