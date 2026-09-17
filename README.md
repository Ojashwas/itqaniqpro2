# ITQAN IQ

A connected performance-management prototype for strategic goals, objectives, KPI registration and targets, action plans, recovery monitoring and approvals. **Intelligence in Performance.** All supplied records are synthetic examples.

## Start

```sh
npm ci
npm start
```

Open [the workspace](http://localhost:5180). Choose a visible role card, select a department where applicable, and choose an assigned demo account to preview its assigned role. Login ID/password and UAE PASS are also displayed; live authentication is not connected. Select **Workspace administrator** to open application configuration.

The app uses vanilla JavaScript, CSS and a Node.js static server. There is no build step. Node must satisfy the development dependencies in `package-lock.json`; this workspace is verified on Node 26.8.2.

## Project structure

```text
ITQAN IQ/
├── public/
│   ├── index.html              # Browser entry point
│   └── assets/               # Product mark and UAE PASS artwork
├── src/
│   ├── app.js                 # UI, routing, local state and workflows
│   ├── features/workspace.js  # Strategy hierarchy, shared recovery, search and catalogues
│   ├── domain/performance.js  # Shared calculations and validation
│   └── styles/main.css        # Layout, components, responsive and RTL styles
├── server/index.cjs           # Static server with explicit public routes
├── tests/
│   ├── actions.test.cjs       # UI, roles, approvals, plans and configuration
│   ├── data.test.cjs          # Calculation and validation tests
│   └── server.test.cjs        # HTTP behavior and asset access tests
├── scripts/smoke-test.cjs     # Eleven-view smoke verification
├── docs/                     # Markdown project documentation
├── package.json
├── package-lock.json
└── .gitignore
```

## Commands

| Command | Purpose |
| --- | --- |
| `npm start` / `npm run dev` | Serve the app at localhost:5180 |
| `npm run check` | Check application, engine, server and smoke-script syntax |
| `npm test` | Run all 51 tests and the eleven-view smoke check |
| `npm run test:unit` | Run calculation, UI/workflow and HTTP tests |
| `npm run test:smoke` | Run the view smoke check |

## Documentation

Start with the [documentation index](docs/README.md). The [functional specification](docs/FUNCTIONAL_SPECIFICATION.md) defines the detailed requirements and acceptance scenarios; the [user guide](docs/USER_GUIDE.md) explains how to use the application. Technical setup, configuration, connected workflows and production dependencies have dedicated guides in `docs/`.

## Connected workflow

1. Strategy Team creates a strategic goal, then its objectives.
2. Departments **Register KPI** against an objective, set definitions/targets and submit for Department then Strategy approval.
3. **Data flows** shows read-only, source-attributed actuals. Live ingestion is not connected.
4. An **action plan** supports an objective or published KPI. A **recovery plan** starts only for a current Amber/Red KPI.
5. Recovery uses one form from every entry point. **Create & submit for approval** starts the review cycle immediately; **Save draft** is an explicit alternative.
6. After both approvals, **Manage plan** supports delivery, evidence and monitoring. Closure follows approval; recovery also requires a current Effective review and sustained Green results.

AI insights searches the scoped workspace and explains navigation using local rules. Administrator accounts open the ten-section Administration screen automatically. The UAE-themed login retains visible role selection, Login ID/password and UAE PASS.

## Current scope

The account picker and department restrictions simulate assigned roles. Records and configuration persist in browser localStorage. Live authentication, server-side authorization, a database, source-system actuals ingestion, outbound notifications and a connected AI service remain unimplemented. Actuals have no manual-entry UI; users register KPIs and set targets.

The maintained Markdown documentation in `docs/` is tracked. New documentation is visible to Git without a folder-wide ignore rule. `docs/` is the canonical documentation folder; there is no maintained `doc/` copy.
