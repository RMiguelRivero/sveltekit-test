import { THEME_STORAGE_KEY } from './theme.constants';

export type Theme = 'light' | 'dark';

export function getInitialTheme(): Theme {
	return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
	document.documentElement.dataset.theme = theme;
	localStorage.setItem(THEME_STORAGE_KEY, theme);
}
