# ITQAN IQ · إتقان

Interactive CONFIDENTIAL CLIENT performance-management prototype based on the supplied functional specification. All people, measures, results and insights are synthetic examples, not official client records. The ITQAN IQ mark on the sign-in page and in the sidebar is the product brand; the client seal beside it is a placeholder, not the official client emblem.

## Run

Requires Node.js. No package installation is needed.

```sh
npm start
```

Open http://localhost:5180 and sign in with any well-formed email and password. Run `npm run check` for syntax and `npm test` for the calculation suite and the ten-view smoke test.

## Suggested walkthrough

1. Sign in with any well-formed email and password, or use Continue with UAE Pass. The gate is a demonstration only — see Boundaries below.
2. Review the executive dashboard and strategic goal achievement.
3. Open Strategy & objectives and drill into a KPI.
4. Open Service completion time to review the critical breach and linked recovery action.
5. Record a new actual. Status, achievement and equal-weight goal scores update automatically; changes persist locally.
6. Change the reporting period. Every view — scores, trends, breaches, notifications, exports and the copilot — re-reads the selected month, and closed periods become read-only.
7. Open Action & recovery and start an action. Closing requires the current and previous period to be Green.
8. Register a KPI in the registry. The new definition stays in Draft until approved from its detail card by the simulated PMO user, then carries no historical observations until an actual is recorded.
9. Try Ask ITQAN's risk, service and forecast prompts.
10. Export a CSV or use the report print preview to save a PDF.
11. Switch to Arabic to preview RTL navigation and the executive dashboard.
12. Sign out from the top bar to return to the sign-in page.

## Implemented prototype scope

Ten navigation views cover strategic alignment, registry, data entry, deterministic scoring, illustrative insights, impact and escalation, recovery actions, reports, preferences and activity history, reached through a demonstration sign-in page. Eight seeded KPIs span four strategic goals and four departments. Search, filters, notifications, forms, local persistence, CSV export and print styling work without backend services.

`data.js` is the single calculation engine. `app.js` is presentation only: every count, achievement, RAG status, trend, breach severity, weight, forecast and trajectory point rendered on screen is produced by that engine, so the figures on the dashboard, registry, strategy map, reports and copilot always reconcile with one another and with the recorded observations.

Higher-is-better and lower-is-better thresholds determine KPI RAG. Achievement is capped at 100%, with equal weights normalised within each parent and equal goal weights overall. Aggregate labels use 95% for Green and 85% for Amber. Historical examples cover April–September 2026 and any month can be selected. KPIs without an observation are reported as No data and excluded from achievement rather than counted as zero. Recovery requires two consecutive Green observations.

## Boundaries

The source functional specification is **not included in this repository** — it is a client document classified `OFFICIAL – Internal`. Everything published here is anonymised prototype code with synthetic data only.

This is a frontend demonstration, not the complete production FSD implementation. The workspace opens behind a demonstration sign-in page that accepts any well-formed email and password, or the UAE Pass button; the session flag is held in browser storage and is not authentication. No live Entra / National SSO, RBAC enforcement, connectors, outbound notifications, trained AI, scheduled reporting, XLSX export, cryptographic audit or sovereign infrastructure is connected. The activity log is editable browser storage. AI answers are deterministic and advisory. Arabic coverage includes navigation, the executive dashboard and seeded KPI names; secondary forms and operational details retain English copy. Review cadence is saved as a preference only.

Data lives in browser localStorage; Administration offers a reset. The ITQAN IQ mark is a resolution-independent SVG ([icon.svg](./icon.svg)) referenced by the sidebar, the sign-in card and the favicon from that single file, so it stays sharp from 16px to app-icon sizes and cannot drift between copies. The mark is the **iQ** monogram: a dotted stem beside a magnifying glass whose lens holds three ascending performance bars, rendered with a gradient tile, sheen, cast depth and a lens highlight. The lockup is drawn from the workspace green so it sits in the same family as the executive overview — deep green `#0d3a30` with the modern green accent `#0d7758` — and sets "ITQAN IQ" in wide-tracked Montserrat with the tagline beneath. RAG status and charts keep their own accessible palette so brand green is never confused with an On track signal. Fonts load from Google Fonts, with local system fallbacks; the interface uses a 12–34px type scale so every label, footnote and table cell stays legible. Production preparation requires full Arabic localisation, accessibility and browser QA, authenticated APIs, server-side validation, approval/version history, integrations and security controls.

## Validation

`npm test` runs the calculation suite (14 tests covering directional boundaries, capped achievement, equal weighting, missing observations, trends, forecasts, recording rules and recovery) and a Node VM smoke test of all ten view renderers, search, status filtering, actual updates, audit recording and RTL switching. HTTP serving and an interactive browser pass over the sign-in gate, every view, both reporting-period and department scopes, the KPI drawer, registration, approval, the recovery rule and sign-out were verified.

