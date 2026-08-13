import type { BadgeVariant } from '$lib/components/ui/types';
import type { ItemStatus } from '$lib/schemas';

export const STATUS_BADGE_VARIANT: Record<ItemStatus, BadgeVariant> = {
	draft: 'outline',
	scheduled: 'default',
	active: 'success',
	paused: 'warning',
	completed: 'default',
	archived: 'outline',
};
