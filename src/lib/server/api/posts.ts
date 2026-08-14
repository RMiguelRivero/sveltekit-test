import { postListSchema, type Post } from '$lib/schemas';
import postsData from '../../../../static/mocks/posts.json';
import { validateData } from './utils';

let postsStore: Post[] | null = null;

function getPostsStore(): Post[] {
	if (postsStore === null) {
		postsStore = validateData(postsData, postListSchema);
	}
	return postsStore;
}

export async function getPosts(): Promise<Post[]> {
	return getPostsStore();
}

export async function getPost(slug: string): Promise<Post | undefined> {
	return getPostsStore().find((post) => post.slug === slug);
}
