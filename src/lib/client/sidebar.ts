import { SIDEBAR_COLLAPSED_STORAGE_KEY } from './sidebar.constants';

export function getInitialSidebarCollapsed(): boolean {
	return localStorage.getItem(SIDEBAR_COLLAPSED_STORAGE_KEY) === 'true';
}

export function setSidebarCollapsed(collapsed: boolean): void {
	localStorage.setItem(SIDEBAR_COLLAPSED_STORAGE_KEY, String(collapsed));
}
