import { describe, expect, it } from 'vitest';
import { jsonLdScriptTag } from './jsonLd';

describe('jsonLdScriptTag', () => {
	const startScriptTag = '<script type="application/ld+json">';
	const endScriptTag = '</script>';

	it('wraps the serialized data in a JSON-LD script tag', () => {
		const html = jsonLdScriptTag({ '@type': 'Organization', name: 'Acme' });

		expect(html.startsWith(startScriptTag)).toBe(true);
		expect(html.endsWith('</script>')).toBe(true);
	});

	it('round-trips the data unchanged through JSON.parse', () => {
		const data = { '@type': 'Article', headline: 'Hello world', count: 3 };
		const html = jsonLdScriptTag(data);
		const json = html.slice(startScriptTag.length, -endScriptTag.length);

		expect(JSON.parse(json)).toEqual(data);
	});

	it('escapes "<" so an embedded closing tag cannot break out of the script block', () => {
		const html = jsonLdScriptTag({ headline: 'Breaking out</script><script>alert(1)</script>' });

		// Only the one real closing tag (the wrapper's own) should be present.
		expect(html.match(/<\/script>/g)).toHaveLength(1);
		expect(html).toContain('\\u003c/script>\\u003cscript>alert(1)\\u003c/script>');
	});

	it('still produces valid, parseable JSON after escaping', () => {
		const data = { headline: endScriptTag };
		const html = jsonLdScriptTag(data);
		const json = html.slice(startScriptTag.length, -endScriptTag.length);

		expect(JSON.parse(json)).toEqual(data);
	});
});
