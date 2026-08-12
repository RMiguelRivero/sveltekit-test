import {
	itemListSchema,
	postListSchema,
	userListSchema,
	type Item,
	type Post,
	type User,
} from '$lib/schemas';
import postsData from '../../../../static/mocks/posts.json';
import usersData from '../../../../static/mocks/users.json';
import itemsData from '../../../../static/mocks/items.json';
import { validateData } from './utils';

export function getValidatedPosts(): Post[] {
	return validateData(postsData, postListSchema);
}

export function getValidatedUsers(): User[] {
	return validateData(usersData, userListSchema);
}

export function getValidatedItems(): Item[] {
	return validateData(itemsData, itemListSchema);
}

export function getPostBySlug(slug: string): Post | undefined {
	return getValidatedPosts().find((post) => post.slug === slug);
}
