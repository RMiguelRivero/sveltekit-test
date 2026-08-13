// Kept out of .svelte markup: eslint-plugin-svelte scans raw file text for
// `<script>` tags to locate script blocks, so a literal `<script>...</script>`
// inside a template-literal in a .svelte file's markup breaks its parser.
export function jsonLdScriptTag(data: unknown): string {
	// JSON.stringify doesn't escape "<", so a "</script>" inside a string field
	// would otherwise close the tag early and let the remainder run as markup.
	const json = JSON.stringify(data).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}
