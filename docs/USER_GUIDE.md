# ITQAN IQ · إتقان

Interactive CONFIDENTIAL CLIENT performance-management prototype based on the supplied functional specification. All people, measures, results and insights are synthetic examples, not official client records. The ITQAN IQ mark on the sign-in page and in the sidebar is the product brand; the client seal beside it is a placeholder, not the official client emblem.

## Run

Requires Node.js. Serving the app needs no package installation. Run `npm ci` before running the automated tests.

```sh
npm start
```

Open http://localhost:5180 and choose a visible role card and an assigned demo account with an assigned role and department. Run `npm run check` for syntax and `npm test` for the calculation suite and the eleven-view smoke test.

## Suggested walkthrough

1. Choose a visible role card on the sign-in screen, select a department where applicable, and choose an assigned demo account. Department contributors and approvers see their assigned department; Strategy Team sees all departments; Administrator manages accounts. Sign out to preview another role. These are simulated accounts, not authenticated identities.
2. Review the executive dashboard and strategic goal achievement.
3. Open Strategy & objectives. Strategy Team or Administrator can **Create strategic goal**, then **Create objective** beneath it. Each goal can hold multiple objectives. Use **Register KPI** on an objective to retain its context.
4. Open Service completion time to review the critical breach and linked recovery action.
5. Use Target setup in KPI details to propose the current period's target and amber boundary. Published targets stay unchanged through Department review and change only after Strategy review. Prior targets and external actuals are preserved.
6. Change the reporting period on Executive overview, Strategy & objectives, Data flows, Impact & escalation, or Reports & analytics. The selection is retained across these analytical views. KPI target setup, AI insights and Plans & recovery use current data and have no reporting-period selector; Administration and Audit trail also omit it.
7. Use the shared **Create** menu to **Register KPI**, create an action plan or **Create recovery plan**. Recovery creation first asks for an eligible KPI, then opens the same form used by Impact & escalation and KPI details. An action can link directly to an objective with a responsible department, or to a published KPI. From a current At risk or Off track KPI, select **Create recovery plan**; its department is inherited from the KPI. KPI and action records remain drafts until submitted. Recovery creation offers **Create & submit for approval**, which immediately starts Department review; **Save draft** is an explicit alternative.
8. For an **action plan**, enter the task, owner, deadline and expected outcome, save and submit. After approval, start delivery, add progress updates and submit completion evidence; a checklist is optional. For a **recovery plan**, review the captured KPI gap, enter cause and corrective steps, select **Create & submit for approval** to start Department then Strategy review. Initial review details and the first milestone are prefilled. After approval, use **Manage plan** to start delivery, add progress/evidence and monitor effectiveness. Recovery closure needs completed milestones, a current Effective review and the configured consecutive Green KPI periods (default two). Both types follow Department then Strategy approval for plans, structural amendments, closure and reopening.

The **Approvals** inbox shows submitted data, current records, decision notes and approval stages, with filters for assigned reviews, submissions, pending and decided requests. Notifications link to assigned decisions, returned submissions and monitoring reviews due. Published KPI names, owners, definitions and objective links can be amended through the same approval flow without rewriting actuals. Requesters cannot approve their own submissions. Wrong-department reviewers cannot decide. Rejected requests can be revised and resubmitted; stale requests cannot be approved. Routine progress, evidence and monitoring are recorded against the approved plan and audited. Changes to plan structure or KPI results, and overdue monitoring reviews, invalidate prior effectiveness verification. Action completion snapshots preserve delivery evidence and links. Recovery closure snapshots also preserve monitoring and KPI evidence. Connected record drawers include Back navigation.

To open **Administration**, sign out, choose the **Administrator** role and the **Workspace administrator** account, and enter the workspace. Administrator sign-in opens Administration automatically; the sidebar and top bar both provide a shortcut. The direct route is `http://localhost:5180/#/admin`. Other roles see an access explanation on that route.

Administration has ten sections with locally saved, audited settings:

- **Organization:** organization and framework labels, default language and sign-in landing page.
- **Strategy & objectives:** create parent strategic goals and child objectives; edit names, owners and responsible departments while retaining KPI links.
- **Lists of values:** maintain KPI types and enable supported units, priorities, review frequencies and source refresh frequencies. New forms use the lists; existing records keep their saved values.
- **Departments:** add departments, record owners and check approver coverage; departments feed account assignment and KPI creation.
- **Users & roles:** manage names, emails, assigned roles, department access and active status.
- **Performance rules:** aggregate Green/Amber boundaries used by goal status and parent-goal escalation. KPI targets and actuals remain unchanged.
- **Approval policy:** review deadlines per stage, department approver coverage and strategy reviewers. New stages use the configured deadline; existing deadlines remain unchanged.
- **Plan & recovery defaults:** consecutive Green periods required for recovery closure, and new-plan priority/deadline and recovery monitoring cadence. Policy changes can invalidate effectiveness reviews; existing closure snapshots remain intact.
- **Notifications:** enable or disable approval, monitoring and performance categories in the in-app notification centre and indicator.
- **Source systems:** add source systems, configure source owners and expected refresh cadence, also displayed in Data flows. These catalogue settings do not create live connections.

Administrators cannot bypass the two-stage business approval policy. Requesters cannot approve their own requests. If a department approver submits a request, another department approver must be assigned. All configuration and accounts remain a local demonstration, not production access control.

All UI queries, direct record views, notifications, search, exports and approval/audit lists respect the current role's department scope. This is application behavior for the demo, **not a security boundary**: every record remains in browser localStorage. Production must enforce these same permissions and approval transactions on an authenticated backend and return only authorized department data.


Explore the connected application from **Strategy & objectives**: each goal contains its objective, linked KPIs and recovery actions. Select an objective to see its performance, recovery coverage and measures, or open its filtered registry and action board. KPI details always show linked actions, including closed actions and actions for healthy measures. KPI-linked plan details show a clickable goal → objective → KPI → plan path. Direct objective actions link back to their objective. Registry rows and impact views also link directly to objectives and recovery. Creating recovery from a KPI automatically links it to that KPI and its objective; all views read the same saved records. Updating a KPI recalculates objective achievement, while closing an action preserves its recovery evidence without changing KPI observations.
Register a KPI with its definition, source application and targets. It stays in Draft through Department and Strategy review. Actuals and baselines must arrive from the source application; neither can be entered manually here.
9. Open AI insights for a simple workspace guide: review KPIs needing attention, search goals, objectives, draft/published KPIs, plans, sources, approval IDs and audit updates; ask how ITQAN IQ works, how to set targets or where actuals come from, and follow direct links to objectives, targets, data flows and recovery. Suggestions respect the selected department and use the latest reporting data; action counts reflect current action state. The guide uses local rules and synthetic workspace data, not a connected AI model.
10. Export a CSV or use the report print preview to save a PDF.
11. Switch to Arabic to preview RTL navigation and the executive dashboard.
12. Sign out from the top bar to return to the sign-in page.

## Implemented prototype scope

Eleven navigation views cover strategic alignment, KPI definitions and target setup, read-only incoming data flows, deterministic scoring, illustrative insights, impact and escalation, recovery actions, reports, approvals, account administration and activity history, reached through a demonstration sign-in page. Eight seeded KPIs span four strategic goals and four departments. Actuals and confidence flags are owned by external source applications; no manual actual-entry form is available. Source integrations are not configured in this prototype. Search, filters, notifications, target forms, local persistence, CSV export and print styling work without backend services.

`src/domain/performance.js` is the single calculation engine. `src/app.js` provides the local UI, role scoping and approval workflow: every count, achievement, RAG status, trend, breach severity, weight, forecast and trajectory point rendered on screen is produced by that engine, so the figures on the dashboard, registry, strategy map, reports and copilot always reconcile with one another and with the recorded observations.

Higher-is-better and lower-is-better thresholds determine KPI RAG. Achievement is capped at 100%, with equal weights normalised within each parent and equal goal weights overall. Aggregate labels default to 95% for Green and 85% for Amber; Administration can change these boundaries, including classification in historical views. Historical examples cover April–September 2026 and any month can be selected. KPIs without an observation are reported as No data and excluded from achievement rather than counted as zero. Recovery defaults to two consecutive Green observations and can require up to six through Administration.

## Boundaries

The source functional specification is **not included in this repository** — it is a client document classified `OFFICIAL – Internal`. Everything published here is anonymised prototype code with synthetic data only.

This is a frontend demonstration. The account picker simulates role-assigned sessions in browser storage; it does not authenticate a person. The UI enforces department scope and two-stage approval behavior, but local data and session values remain inspectable/editable. No live SSO, server authorization, external source connector, outbound notification, trained AI or tamper-proof audit service is connected. AI answers use local rules. Arabic navigation and core workflows are supported, while some administration and approval details retain English copy. Existing plans without approval metadata are preserved as drafts requiring review before execution.

Data, role assignments and approval records persist in browser localStorage. The ITQAN IQ mark is a resolution-independent SVG ([icon.svg](../public/assets/icon.svg)) referenced by the sidebar, the sign-in card and the favicon from that single file, so it stays sharp from 16px to app-icon sizes and cannot drift between copies. The mark is the **iQ** monogram: a dotted stem beside a magnifying glass whose lens holds three ascending performance bars, rendered with a gradient tile, sheen, cast depth and a lens highlight. The lockup is drawn from the workspace green so it sits in the same family as the executive overview — deep green `#0d3a30` with the modern green accent `#0d7758` — and sets "ITQAN IQ" in wide-tracked Montserrat with the tagline beneath. RAG status and charts keep their own accessible palette so brand green is never confused with an On track signal. Fonts load from Google Fonts, with local system fallbacks; the interface uses a 12–34px type scale so every label, footnote and table cell stays legible. Production preparation requires full Arabic localisation, accessibility and browser QA, authenticated APIs, server-side validation, approval/version history, integrations and security controls.

## Validation

`npm test` runs 51 tests covering calculations, department-scoped views/search/CSV, direct-record guards, all ten admin sections, saved configuration and its workflow effects, assigned-role sign-in, two-stage approval via UI controls, no self-approval, rejection/resubmission, stale requests, KPI amendments, approval notifications/filters, corrective plans, monitoring freshness, closure guards, period scoping, Back navigation, read-only actuals and target history. HTTP checks cover public assets, private-path rejection, malformed requests and HEAD requests. The Node VM smoke test covers all eleven views. `npm run check` validates frontend and server syntax. The redesigned login has been checked in headless Chrome at desktop and mobile sizes, including Arabic/RTL; the changed strategy, plan, recovery, Impact, lists and search screens have also been checked at desktop/mobile widths; comprehensive accessibility and browser QA remain separate work.

Live identity, backend authorization and source data integrations remain unimplemented. The exact inputs and required production behavior are documented in [Connection requirements](INTEGRATIONS.md).
