import { tagListSchema, type Tag } from '$lib/schemas';
import tagsData from '../../../../static/mocks/tags.json';
import { validateData } from './utils';

let tagsStore: Tag[] | null = null;

function getTagsStore(): Tag[] {
	if (tagsStore === null) {
		tagsStore = validateData(tagsData, tagListSchema);
	}
	return tagsStore;
}

export async function getTags(): Promise<Tag[]> {
	return getTagsStore();
}
