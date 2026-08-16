import { describe, expect, it } from 'vitest';
import { cn } from './cn';

describe('cn', () => {
	it('joins multiple string class names', () => {
		expect(cn('flex', 'items-center')).toBe('flex items-center');
	});

	it('drops falsy values (conditional classes)', () => {
		const fail = false; // workaround for no-constant-binary-expression
		expect(cn('flex', fail && 'hidden', undefined, null, '')).toBe('flex');
	});

	it('supports the clsx object syntax for conditional classes', () => {
		expect(cn('base', { active: true, disabled: false })).toBe('base active');
	});

	it('resolves conflicting Tailwind utilities, keeping the last one', () => {
		expect(cn('p-2', 'p-4')).toBe('p-4');
	});

	it('merges conflicts across combined sources in argument order', () => {
		expect(cn('text-sm text-black', 'text-lg')).toBe('text-black text-lg');
	});
});
