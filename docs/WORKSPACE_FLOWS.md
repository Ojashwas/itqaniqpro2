# Connected workspace and screen responsibilities

**Reviewed: 17 September 2026.** Use this map to understand where work begins and how records connect. Detailed business rules are in the [functional specification](FUNCTIONAL_SPECIFICATION.md); step-by-step instructions are in the [user guide](USER_GUIDE.md).

## Where each activity belongs

| Screen | Purpose | Main actions |
| --- | --- | --- |
| Executive overview | Summarize authorized performance | Review achievement, goal roll-ups, trends and attention items; open connected records |
| Strategy & objectives | Maintain the strategic hierarchy and explore its relationships | Create strategic goal; create objectives beneath a goal; register an objective's KPI; create an objective action |
| KPI registry | Register measures, set targets and propose enhancements | Register KPI; edit a draft; propose definition, formula, source-key or objective changes; submit targets |
| Data flows | Explain how source applications map to KPI actuals | Review source, metric key, actual, confidence and expected refresh; open mapped KPI |
| AI insights | Search authorized workspace records and explain the application | Find goals, objectives, KPIs including drafts, plans, sources, approvals and audit updates; follow result links; ask for help |
| Impact & escalation | Explain KPI gaps, trends, strategic impact and escalation | Switch between Needs attention and All KPIs; view linked updates/approvals; create KPI action or eligible recovery |
| Plans & recovery | Create and manage delivery and recovery | Create action plan; create recovery plan; filter type and status; use Open, In progress and Closed cards |
| Approvals | Govern KPI and plan changes | Review submitted/current values; approve or return with notes; track Department then Strategy review |
| Administration | Configure the application and shared values | Manage strategy, departments, accounts, lists, sources, scoring, approval policy, defaults and notifications |
| Reports & analytics | Share the authorized published performance view | Export CSV, compare departments or open the executive print view |
| Audit trail | Review recorded local activity | Inspect events, actors and timestamps within role scope |

The top-bar search opens AI insights and uses the same scoped search. It does not change business data. AI insights is currently a local search and guide; a connected language-model service is not configured.

Reporting-period selection belongs only to overview, strategy, data flows, impact and reports. KPI setup, plans and AI guidance use September 2026, the latest sample measurement period. Administration, approvals and audit have no reporting-period selector. Deadlines and monitoring dates follow the real calendar.

## Strategic goal → Objectives → KPIs

Strategy Team and Administrator accounts can create strategic goals and their child objectives. A strategic goal has its own identity, name, optional Arabic name/description and accountable owner. A goal may initially have no objectives. Creating one offers the next step, **Create objective**, with the parent preselected.

Each objective has one parent strategic goal, its own name, owner and responsible department. Multiple objectives can belong to the same goal. **Register KPI** from an objective preselects that objective. Objectives can also carry simple action plans without a KPI.

Hierarchy maintenance saves directly with audit history for Strategy Team or Administrator. KPI publication, published-definition changes and targets follow business approval. Source actuals remain read-only. A KPI belongs to one objective/department; a plan belongs to one KPI, or to one objective plus a responsible department for direct actions.

Existing saved workspaces migrate their previous goal/objective pairs into separate parent goals and child objectives without changing KPI or plan references. Goal label changes propagate to connected views; objective edits retain the existing objective reference. Department users see their assigned objectives or objectives connected to their permitted KPIs/plans. Strategy Team and Administrator see the complete hierarchy.

KPI achievements are averaged within an objective. Measured objectives have equal weight within their strategic goal; measured goals have equal weight overall. Missing observations do not create zero scores. Adding a second objective to a goal does not give that goal twice the overall weight.

## One recovery creation flow

| Entry point | First step | Shared next step |
| --- | --- | --- |
| Plans & recovery → Create recovery plan | Choose an eligible KPI in the current department/linked-record scope | Recovery form |
| Create menu → Create recovery plan | Choose an eligible KPI in the current department scope | Recovery form |
| Impact & escalation → Create recovery plan | The KPI is already selected | Same recovery form |
| KPI details → Create recovery plan | The KPI is already selected | Same recovery form |

The chooser uses current source actuals and approved target direction. Only published Amber/Red KPIs qualify. Healthy, missing-data and draft KPIs do not qualify; historical results do not initiate a new recovery. The chooser shows existing open recoveries so a user can open them before deciding whether more work is needed. Multiple plans are permitted.

All entry points use identical fields and defaults: fixed KPI, read-only actual/target trigger, title, owner, deadline, priority, expected outcome, cause, corrective steps and next review. **Create & submit for approval** creates the Open plan and immediately starts Department review, followed by Strategy review. There is no second submission step in Manage plan. Entered steps initialize a milestone; review defaults and success criteria are initialized from the KPI and configuration.

**Save draft** is a separate secondary choice for unfinished corrective detail and does not create an approval request. It still requires valid basic plan details and an eligible KPI. Complete the draft and submit from Manage plan later. The primary action requires cause, corrective steps and a valid review date in addition to the basic plan details. Invalid primary submission creates neither a plan nor an approval request.

**Manage plan** shows the current approval stage and locks changes/execution while review is pending. After both approvals, use it to start recovery, record progress, complete milestone evidence and monitor effectiveness. Routine delivery updates are audited; changes to approved scope, owners, dates or corrective details require amendment approval. Completion requires milestone evidence, an effective current review and the configured sustained Green results.

Action plans remain simple tasks for an objective or KPI. They require task, owner, deadline and outcome; progress notes/checklists are available. Completion requires delivery evidence and approval, without a recovery monitoring or Green-result gate.

## Connected navigation and plan status

Objective details open the linked registry or plan board. KPI details open the objective, source-filtered Data flows and all linked plans, including closed plans and actions on healthy KPIs. KPI-linked plan drawers show goal → objective → KPI → plan; direct objective actions link back to the objective. Contextual Back returns to the previous drawer. Clear linked filters on lists to widen the view.

Open, In progress and Closed describe execution. An Open plan can be a draft, under Department/Strategy review, or approved and awaiting Start. Manage plan displays the request badge separately. Recovery creation clears stale plan filters and opens the new plan. The Recovery verified board metric indicates sustained Green readiness, not completed closure approval.

Pending requests lock governed edits. Routine progress/evidence and monitoring remain separate from structural amendments. Changes to approved scope, owners, deadlines or milestone structure need approval. Closure/reopening also require both stages. See [Workflows](WORKFLOWS.md) for the exact gates.

## Configurable lists

Administration → **Lists of values** provides:

- **KPI types:** maintain a unique list, including additional categories beyond Leading/Lagging.
- **KPI units:** enable supported units (`%`, days, min, count, rate).
- **Plan priorities:** enable High, Medium and Low.
- **Recovery review frequency:** enable Weekly, Fortnightly and Monthly.
- **Source refresh frequency:** enable Daily, Weekly and Monthly.

At least one value must remain. KPI type names are unique case-insensitively, non-empty and at most 60 characters. An active default cannot be disabled until the default is changed. New forms use active values; an existing record's saved value remains available when editing it. Retiring a KPI type does not invalidate an existing record or a pending approval. Changes persist and are audited. See [Configuration](CONFIGURATION.md) for all ten administration sections and policy effects.

Departments, strategic goals/objectives, source systems and accounts have their own configuration sections. Source systems can be added before KPI registration; their names are offered as registration suggestions. A registration may also name another source, which becomes part of the catalogue. Source metric/field keys map incoming values to KPIs; changing an approved KPI's mapping or formula requires the usual approval cycle. No source configuration establishes a live connection or allows actuals to be entered manually.

Execution statuses, plan types, approval stages, roles, measurement directions and the monthly reporting calendar retain their governed meanings. The admin screen identifies these as system values; this release does not provide a workflow designer.

## Validation

Existing automated coverage includes identical recovery forms from every entry point, eligible-KPI filtering, immediate recovery submission and approval locks, hierarchy migration/persistence, department access, configurable lists with historical retention, source mappings, workspace search and multi-objective weighting. Prior browser layout checks covered the changed screens at 1440px and 390px widths. See [Development](DEVELOPMENT.md#verification) for the verification baseline and remaining QA scope.
