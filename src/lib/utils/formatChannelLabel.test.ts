import { describe, expect, it } from 'vitest';
import { formatChannelLabel } from './formatChannelLabel';

describe('formatChannelLabel', () => {
	it('uppercases the sms channel as an acronym', () => {
		expect(formatChannelLabel('sms')).toBe('SMS');
	});

	it('capitalizes other channels normally', () => {
		expect(formatChannelLabel('email')).toBe('Email');
		expect(formatChannelLabel('web')).toBe('Web');
		expect(formatChannelLabel('social')).toBe('Social');
		expect(formatChannelLabel('push')).toBe('Push');
	});
});
