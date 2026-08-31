export const SESSION_COOKIE_NAME = 'session';

export const SESSION_DURATION_SECONDS = 60 * 60;

export const DEV_FALLBACK_SESSION_SECRET = 'change-me-in-production';

// Must match the route folder at src/routes/api/session/+server.ts.
export const SESSION_CHECK_PATHNAME = '/api/session';
