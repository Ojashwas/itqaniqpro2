# Development guide

**Reviewed: 17 September 2026.** Source layout and runtime boundaries are described in [Architecture](ARCHITECTURE.md).

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

`npm run check` validates JavaScript syntax. At the 17 September 2026 application baseline, `npm test` passed all **51** calculation, UI/workflow and HTTP tests, followed by the eleven-view VM smoke check. Coverage includes role scope, the strategic hierarchy, shared recovery creation/submission, KPI and plan approvals, monitoring/closure gates, configurable lists, source mappings, search, login behavior and static asset access.

The automated UI suite uses JSDOM, not a rendered browser. Existing Chrome layout checks cover the UAE login at 1440, 1024, 768, 390 and 320 CSS-pixel widths, including Arabic/RTL checks at desktop and mobile sizes. Changed strategy, plans, impact, lists and search screens have also received desktop/mobile checks. These checks do not replace full accessibility, browser compatibility, security or business acceptance review.

For workflow changes, exercise draft/save/submit paths, both approval stages, rejection/resubmission, department restrictions and the relevant final-approval validation. Use [functional acceptance scenarios](FUNCTIONAL_SPECIFICATION.md#161-business-acceptance-catalogue) as the business checklist. `npm run test:unit` runs the Node suites; `npm run test:smoke` runs only the VM check.

Tests resolve source files relative to their own files. The server resolves its assets relative to the repository, so it can also be started by an absolute path from another working directory.

## Change placement

| Change | Files |
| --- | --- |
| Scoring or validation | `src/domain/performance.js`, `tests/data.test.cjs` |
| Forms, navigation, permissions or workflows | `src/app.js`, `tests/actions.test.cjs` |
| Hierarchy, shared recovery chooser, lists or workspace search | `src/features/workspace.js`, `tests/actions.test.cjs`; calculation changes also use the domain engine |
| Styling | `src/styles/main.css` |
| Entry markup or brand assets | `public/index.html`, `public/assets/` |
| Public HTTP behavior | `server/index.cjs`, `tests/server.test.cjs` |
| Workspace verification | `scripts/smoke-test.cjs` |
| Behavior/setup documentation | Relevant files under `docs/` and the root README |

Keep calculations in the shared engine rather than duplicating them in views. Route business changes through approval requests. Preserve historical targets, external observations and closure evidence. If adding a public asset, explicitly add its route to the server allowlist and reference that URL from the browser.

## Data and repository conventions

Application data persists per browser origin. A different hostname or port uses a different local workspace. Reorganizing files preserves the storage keys and public URLs. Use a separate browser profile for a clean demonstration without deleting existing work. Do not reset the shared browser workspace as part of a routine test run.

`node_modules/` is ignored. `.gitignore` excludes `/docs/*` and explicitly allows the ten maintained project Markdown files. These Markdown files are tracked; original client material and unlisted files remain excluded. New project documentation needs an explicit allowlist entry and a link in [the documentation index](README.md). `docs/` is the maintained directory, not `doc/`.

Do not commit confidential source documents, real user records or credentials. Integration setup belongs in a future backend/secret store, not the frontend configuration forms.

## Documentation changes

Use the current source and tests to verify implemented behavior. Update the functional specification's requirement IDs, relevant acceptance scenarios, user steps and configuration effects together. Label future integration contracts and open decisions explicitly; do not describe the demo role picker, source catalogue or local guide as live services.

For Markdown-only changes, check local links and heading anchors, repository paths, table structure, consistent button names and `git diff --check`. Application tests need to be rerun when executable behavior changes; a documentation-only edit does not create new runtime coverage.
