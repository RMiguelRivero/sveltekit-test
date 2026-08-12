export type Locale = 'en' | 'de';

export type SortDirection = 'asc' | 'desc';

export type UserRole = 'admin' | 'editor' | 'viewer';

export type ItemStatus =
	| 'draft'
	| 'scheduled'
	| 'active'
	| 'paused'
	| 'completed'
	| 'archived';

export type ItemChannel = 'email' | 'sms' | 'web' | 'social' | 'push';
