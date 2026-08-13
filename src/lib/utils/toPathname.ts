// `resolve()` is typed against a generated union of literal route/pathname templates,
// which a computed `string` can never satisfy structurally even when well-formed at
// runtime (these pathnames are built from our own locale + query-string logic, always
// starting with "/"). Assert the concrete shape `resolve` accepts instead of losing
// its base-path resolution and the `svelte/no-navigation-without-resolve` lint check.
export function toPathname(path: string): `/${string}` {
	return path as `/${string}`;
}
