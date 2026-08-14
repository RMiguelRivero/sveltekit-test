import { userListSchema, type User } from '$lib/schemas';
import usersData from '../../../../static/mocks/users.json';
import { validateData } from './utils';

let usersStore: User[] | null = null;

function getUsersStore(): User[] {
	if (usersStore === null) {
		usersStore = validateData(usersData, userListSchema);
	}
	return usersStore;
}

export async function getUsers(): Promise<User[]> {
	return getUsersStore();
}
