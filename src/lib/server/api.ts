import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';
import {
	itemListSchema,
	postListSchema,
	userListSchema,
	type Item,
	type Post,
	type User,
} from '$lib/schemas';

const mockRoot = join(process.cwd(), 'static', 'mocks');

export function readValidatedJson<TSchema extends z.ZodTypeAny>(
	filename: string,
	schema: TSchema,
): z.infer<TSchema> {
	const targetPath = join(mockRoot, filename);

	try {
		const fileContent = readFileSync(targetPath, 'utf-8');

		let parsed: unknown;
		try {
			parsed = JSON.parse(fileContent) as unknown;
		} catch (error) {
			throw new Error(`Unable to parse JSON in ${filename}: ${String(error)}`, { cause: error });
		}

		const validationResult = schema.safeParse(parsed);
		if (!validationResult.success) {
			const issues = validationResult.error.issues
				.map((issue) => `${issue.path.join('.') || 'root'}: ${issue.message}`)
				.join('; ');
			throw new Error(`Schema validation failed for ${filename}: ${issues}`, {
				cause: validationResult.error,
			});
		}

		return validationResult.data;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Mock data load failed for ${filename}: ${message}`, { cause: error });
	}
}

export function getValidatedPosts(): Post[] {
	return readValidatedJson('posts.json', postListSchema);
}

export function getValidatedUsers(): User[] {
	return readValidatedJson('users.json', userListSchema);
}

export function getValidatedItems(): Item[] {
	return readValidatedJson('items.json', itemListSchema);
}

export function getPostBySlug(slug: string): Post | undefined {
	return getValidatedPosts().find((post) => post.slug === slug);
}
