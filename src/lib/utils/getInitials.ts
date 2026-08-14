const INITIALS_LENGTH = 2;

export function getInitials(name: string): string {
	return name
		.trim()
		.split(/\s+/)
		.filter(Boolean)
		.slice(0, INITIALS_LENGTH)
		.map((part) => part[0]?.toUpperCase() ?? '')
		.join('');
}
