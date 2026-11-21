# Repository Guidelines

## Project Structure & Module Organization

ShopLedger is a Node.js/Express point-of-sale app. `server.js` mounts the HTTP routes and serves the browser interface. `routes/` contains endpoint handlers; `lib/` holds pricing, GST, inventory, order, Khata ledger, reporting, invoice, and JSON-store logic. `public/` contains `index.html`, `js/app.js`, and `css/style.css`. Runtime records are stored in `data/db.json`; shop settings, GST slabs, and coupons are in `config.js`. `docs/architecture.svg` diagrams the application. There is currently no test directory.

## Build, Test, and Development Commands

- `npm start` runs `node server.js`; open `http://localhost:3000` (or the configured `PORT`).
- `npm test` currently exits with “no test specified”; do not treat it as a passing test suite.

No build, lint, or formatting scripts are configured. Avoid changing live sample data while developing; back up `data/db.json` before any manual experiments.

## Coding Style & Naming Conventions

Follow the existing CommonJS style (`require`/`module.exports`), two-space indentation, single-quoted strings, and semicolons. Keep HTTP parsing and response handling in `routes/`; put reusable business rules in `lib/`. Use lowercase filenames such as `pricing.js`, descriptive camelCase function names, and route paths that match the existing resource pattern (for example, `/orders/:id/cancel`). Round monetary calculations consistently and preserve current order fields unless a migration is included.

## Testing Guidelines

There is no test framework or test suite in this repository. For changes, manually verify the affected flow in a local copy, including validation failures and saved JSON state. For pricing or GST changes, compare checkout totals with the printable invoice and GST reconciliation report. Do not claim `npm test` validates behavior until a real suite is added.

## Commit & Pull Request Guidelines

Recent history uses short, imperative, sentence-case subjects, often describing a feature (for example, “support hsn gst slabs and coupon maxDiscount caps”). Keep commits focused and use a concise action-oriented subject. PRs should explain the behavior change, list affected routes/modules, describe manual checks, and include screenshots for visible UI or invoice changes. Call out any `data/db.json` format changes and provide migration or backup guidance.

## Security & Configuration

Do not commit credentials or real customer data. `config.js` currently contains operational settings and an admin key; move secrets to environment configuration before deploying. Treat `data/db.json` as sensitive because it contains customer and transaction information.
