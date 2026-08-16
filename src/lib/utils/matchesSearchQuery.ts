import type { Locale, Post } from '$lib/schemas';

export function matchesSearchQuery(post: Post, locale: Locale, query: string): boolean {
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) {
		return true;
	}

	const { title, excerpt } = post.translations[locale];
	return (
		title.toLowerCase().includes(normalizedQuery) || excerpt.toLowerCase().includes(normalizedQuery)
	);
}
