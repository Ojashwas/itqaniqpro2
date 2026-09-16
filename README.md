# ITQAN IQ

A connected performance-management prototype for objectives, KPI target registration, corrective plans, recovery monitoring and approvals. All supplied records are synthetic examples.

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
│   └── assets/icon.svg        # Shared product mark
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

Start with the [documentation index](docs/README.md), [architecture](docs/ARCHITECTURE.md), [development guide](docs/DEVELOPMENT.md), [user guide](docs/USER_GUIDE.md), [workflows](docs/WORKFLOWS.md), [administration](docs/CONFIGURATION.md), and [integration requirements](docs/INTEGRATIONS.md).

## Current scope

The account picker and department restrictions simulate assigned roles. Records and configuration persist in browser localStorage. Live authentication, server-side authorization, a database, source-system actuals ingestion, outbound notifications and a connected AI service remain unimplemented. Actuals have no manual-entry UI; users register KPIs and set targets.

Private client specifications remain excluded by `.gitignore`. Project documentation is in `docs/`; the existing ignore rule also excludes these local Markdown files.
