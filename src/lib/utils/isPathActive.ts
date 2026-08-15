export function isPathActive(pathname: string, matchUrl: string, exact: boolean): boolean {
	return exact ? pathname === matchUrl : pathname.startsWith(matchUrl);
}
