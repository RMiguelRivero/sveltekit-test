import type { UserRole } from '$lib/schemas';

// Shared between the items update action (server-side gate) and the items table (client-side
// disable) so the two never drift — the server check is the actual authorization boundary,
// the client check just avoids offering a control the request would reject anyway.
const ITEM_EDITABLE_ROLES: ReadonlySet<UserRole> = new Set(['admin', 'editor']);

export function canEditItems(role: UserRole): boolean {
	return ITEM_EDITABLE_ROLES.has(role);
}
