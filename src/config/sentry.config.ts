// src/config/sentry.config.ts
import * as Sentry from '@sentry/node';

const isDev = process.env.NODE_ENV === 'development';
const enableLocal = process.env.SENTRY_ENABLE_LOCAL === 'true';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: isDev ? 1.0 : 0.2,
  beforeSend(event) {
    // Prevent sending local errors unless explicitly allowed
    if (isDev && !enableLocal) return null; // skip sending to Sentry

    if (isDev) {
      event.tags = {
        ...event.tags,
        environment: 'localhost',
      };
    }
    return event;
  },
});

export { Sentry, isDev, enableLocal };
