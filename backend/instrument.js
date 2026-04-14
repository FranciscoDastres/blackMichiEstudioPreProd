// Sentry — debe cargarse antes que cualquier otro módulo a instrumentar.
import * as Sentry from "@sentry/node";

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? 0.1),
    release: process.env.RENDER_GIT_COMMIT || undefined,
  });
}
