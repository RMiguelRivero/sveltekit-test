// Prints the Chromium executable Playwright already downloaded (for e2e — see
// playwright.config.ts), so CI/local shells can do
// `CHROME_PATH="$(node scripts/print-chrome-path.mjs)"` before invoking `lhci autorun`.
// chrome-launcher (which both plain Lighthouse and LHCI's puppeteerScript-driven collect
// rely on) reads CHROME_PATH directly. Reusing Playwright's Chromium — rather than adding
// a `puppeteer` devDependency that would download a second, separate copy — avoids a
// redundant ~300MB browser download in CI; `puppeteer-core` (needed to drive the
// dashboard's login puppeteerScript, see lighthouse/dashboard-login.cjs) is already a
// transitive dependency of `@lhci/cli` and is API-compatible once given an explicit path.
import { chromium } from '@playwright/test';

process.stdout.write(chromium.executablePath());
