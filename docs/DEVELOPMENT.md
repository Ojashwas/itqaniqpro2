# Development guide

## Local setup

Install Node.js and npm compatible with the locked dependencies. The project has been verified in this workspace with Node 26.8.2. From the project root:

```sh
npm ci
npm start
```

Open `http://localhost:5180`. Serving the application uses Node built-ins; `npm ci` installs the development dependencies needed by the test suite. No build step or generated output directory is required.

To use a different local port in PowerShell:

```powershell
$env:PORT = '5181'
npm start
```

The listener binds to `127.0.0.1`. `PORT` must be an integer from 1 to 65535. `npm run dev` is an alias for the same server, without a watcher. Refresh the browser after frontend changes; restart the process after server changes.

## Verification

```sh
npm run check
npm test
```

`npm run check` validates JavaScript syntax. `npm test` runs 38 calculation, UI/workflow and HTTP tests, followed by the eleven-view VM smoke test. The suites verify role scope, target approvals, monitoring and closure rules, saved admin settings, public asset serving and private route rejection.

The checks do not establish visual correctness or production security. For browser review, walk through registration, target approval, recovery monitoring and all admin sections; check narrow screens and Arabic/RTL. The current automated UI suite uses JSDOM, not a rendered browser.

Tests resolve source files relative to their own files. The server resolves its assets relative to the repository, so it can also be started by an absolute path from another working directory.

## Change placement

| Change | Files |
| --- | --- |
| Scoring or validation | `src/domain/performance.js`, `tests/data.test.cjs` |
| Forms, navigation, permissions or workflows | `src/app.js`, `tests/actions.test.cjs` |
| Styling | `src/styles/main.css` |
| Entry markup or brand asset | `public/index.html`, `public/assets/icon.svg` |
| Public HTTP behavior | `server/index.cjs`, `tests/server.test.cjs` |
| Workspace verification | `scripts/smoke-test.cjs` |
| Behavior/setup documentation | Relevant files under `docs/` and the root README |

Keep calculations in the shared engine rather than duplicating them in views. Route business changes through approval requests. Preserve historical targets, external observations and closure evidence. If adding a public asset, explicitly add its route to the server allowlist and reference that URL from the browser.

## Data and repository conventions

Application data persists per browser origin. A different hostname or port uses a different local workspace. Reorganizing files preserves the storage keys and public URLs. Use a separate browser profile for a clean demonstration without deleting existing work.

`node_modules/` and private client specifications are ignored. The existing `Docs/` ignore rule remains intact; on this Windows workspace it also matches the private `docs` directory. Maintained project documentation is now in `docs/`; the existing ignore rule also excludes these local Markdown files.

Do not commit confidential source documents, real user records or credentials. Integration setup belongs in a future backend/secret store, not the frontend configuration forms.
