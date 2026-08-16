import type { ItemChannel } from '$lib/schemas';
import { capitalize } from './capitalize';

export function formatChannelLabel(channel: ItemChannel): string {
	return channel === 'sms' ? 'SMS' : capitalize(channel);
}
