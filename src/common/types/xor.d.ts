type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

type XOR<T, U> =
	(T extends object ? Without<T, U> & U : T) | (U extends object ? Without<U, T> & T : U);
