import { LOCALES_SET, type Locale } from './constants';

// Converts unions of objects into a merged intersection
type UnionToIntersection<U> = (U extends unknown ? (value: U) => void : never) extends (
	value: infer I,
) => void
	? I
	: never;

// Recursively builds nested object types from dot-notated string keys
type BuildObject<
	Key extends string,
	Value extends string,
> = Key extends `${infer Head}.${infer Tail}`
	? { [K in Head]: BuildObject<Tail, Value> }
	: { [K in Key]: string };

// Accumulator interface for strict runtime iteration without `any`
type NestedRecord = { [key: string]: string | NestedRecord };

// Public type helper
export type Unflatten<T extends Record<string, string>> = Prettify<
	UnionToIntersection<
		{
			[K in keyof T & string]: BuildObject<K, T[K]>;
		}[keyof T & string]
	>
>;

export function unflatten<T extends Record<string, string>>(flatObject: T): Unflatten<T> {
	const result: NestedRecord = {};

	for (const [key, value] of Object.entries(flatObject)) {
		const keys = key.split('.');
		let current = result;

		for (let i = 0; i < keys.length; i++) {
			const k = keys[i];

			if (i === keys.length - 1) {
				current[k] = value;
			} else {
				const existing = current[k];
				if (typeof existing === 'object' && existing !== null) {
					current = existing;
				} else {
					const nextLevel: NestedRecord = {};
					current[k] = nextLevel;
					current = nextLevel;
				}
			}
		}
	}

	return result as Unflatten<T>;
}

export function isLocale(value: string): value is Locale {
	return LOCALES_SET.has(value);
}
