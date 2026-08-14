export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export type BadgeVariant = 'default' | 'success' | 'warning' | 'destructive' | 'outline';

export type ContainerSize = 'sm' | 'md' | 'lg' | 'full';

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type ToastVariant = 'default' | 'success' | 'error';

export interface ToastItem {
	id: string;
	message: string;
	variant: ToastVariant;
}
