# ITQAN IQ user guide

**Reviewed: 17 September 2026.** ITQAN IQ connects strategic goals, objectives, KPI definitions and targets, action plans, recovery plans and approvals. All supplied accounts and performance records are synthetic examples. The application currently saves work in this browser.

## Start and sign in

Run `npm ci` and `npm start` from the project root, then open [ITQAN IQ](http://localhost:5180). Full setup instructions are in [Development](DEVELOPMENT.md).

The UAE-themed login displays **Intelligence in Performance.** above the role selector, with **Clarity. Confidence. Impact.** as the supporting line.

1. Select one of the four visible role cards.
2. For a department role, select the department.
3. Choose a matching active demo account and review the access summary.
4. Select **Enter selected workspace**. No password is needed for demo access.

Login ID/password and UAE PASS are visible organization sign-in options, but live identity is not connected. They show connection guidance and do not sign you in. English/Arabic can be selected before entry; role choices survive the language change. See [Login experience](LOGIN.md).

| Role | What you can do |
| --- | --- |
| Department Contributor | View your department, register KPIs, propose targets/changes, create plans and record approved delivery |
| Department Approver | The same departmental work, plus first-stage approval of another person's requests |
| Strategy Team | Work across departments, maintain goals/objectives and perform final approval of another person's requests |
| Administrator | View all departments, maintain the hierarchy, configure the application and manage accounts; no KPI/plan business writes or approval bypass |

Sign out from the top bar to change demo accounts. Sign-out preserves workspace records.

## Find the right screen

| Screen | Use it for |
| --- | --- |
| Executive overview | Performance totals, strategic achievement, trends and attention items |
| Strategy & objectives | Goals, their objectives, linked KPIs and direct objective actions |
| KPI registry | **Register KPI**, edit drafts, propose published-definition changes and set current targets |
| Data flows | Read source-attributed actuals, source metric keys, confidence and expected refresh |
| AI insights | Search the permitted workspace and get explanations with navigation links |
| Impact & escalation | Understand KPI gaps, advisory escalation, recent updates and linked plans |
| Plans & recovery | Create plans; manage Open, In progress and Closed work |
| Reports & analytics | Published-KPI CSV export, department comparisons and a print view |
| Approvals | Review requests, decisions, deadlines and returned submissions |
| Administration | Shared configuration and accounts; Administrator only |
| Audit trail | Scoped local business and configuration activity |

Reporting-period selection appears only on Executive overview, Strategy & objectives, Data flows, Impact & escalation and Reports & analytics. Those analytical views share their selected month. KPI setup, plans and AI guidance use the latest sample month, **September 2026**. Approval, administration and audit work have no period selector. Plan deadlines and review dates use today's calendar, independently of the sample measurement period.

## Create the strategic hierarchy

As Strategy Team or Administrator:

1. Open **Strategy & objectives → Create strategic goal**.
2. Enter its name and owner; Arabic name and description are optional.
3. Select **Create goal & add objective** to open the objective form under that goal.
4. Enter the objective, owner and responsible department, then save.
5. Add further objectives from the goal's **Create objective** button.

A goal can be saved before its objectives are completed. Multiple objectives may belong to a goal. Names and owners can be edited without losing existing links. Hierarchy changes save directly with audit history; they do not enter the KPI/plan approval cycle.

From an objective, use **Register KPI** to preselect that objective, or **Create action plan** to define work without a KPI. Department users view their relevant hierarchy but do not edit it.

## Register and maintain a KPI

1. Open **KPI registry → Register KPI**, the global **Create → Register KPI**, or an objective's **Register KPI** button.
2. Enter name, owner, source application, definition and measurement formula. Add a source metric/field key if known.
3. Select the objective, permitted department, type, measurement direction and unit.
4. Set the target and Amber boundary, then choose **Save draft for approval**.
5. Open the saved KPI and submit it for approval. Saving a KPI draft does not submit it automatically.

The KPI remains Draft through Department review and publishes only after Strategy review. New KPIs have no actual observations and do not invent historical results.

For a published KPI, use **Propose KPI changes** for name, owner, definition, formula, source metric key or objective, with a reason. Use **Target setup** for current-period target/Amber changes. Active values stay unchanged until both approvals complete. Previous targets and all actuals are preserved.

Source application, department, unit and measurement direction are not editable through the published-definition amendment form. Types and supported units offered for registration come from Administration.

## Understand actuals and performance

Actuals and baseline observations belong to source applications. There is no **Record actual** form. Plan progress and monitoring evidence are text about delivery, not KPI observations.

**Data flows** groups published KPIs by source and shows their actual, confidence, mapping key, source owner and expected refresh. Follow **View data flows** from a KPI or select a source search result to filter both source cards and the incoming-results table. Use **Show all sources** to clear it. Source configuration does not establish a live connection; displayed history is synthetic.

For Higher is better, an actual at or above target is Green; for Lower is better, an actual at or below target is Green. Amber and Red use the approved Amber boundary. Missing values display No data. Objective achievement averages measured KPIs, strategic-goal achievement averages measured objectives, and overall achievement averages measured goals. Completing a plan does not change those observations or scores.

## Choose an action plan or recovery plan

| Question | Action plan | Recovery plan |
| --- | --- | --- |
| Why create it? | Deliver a task supporting an objective or KPI | Restore a KPI whose current actual misses its target |
| What can it link to? | An objective and department, or a published KPI, including a healthy KPI | One published KPI currently Amber/Red |
| How is it submitted? | Save the draft, then submit | **Create & submit for approval**; optional **Save draft** |
| What do you manage? | Task, owner, deadline, outcome, progress and optional checklist | Cause, corrective work, milestones, review schedule and effectiveness |
| What proves completion? | Delivery evidence and any checklist completion | Milestone evidence, a current Effective review and consecutive Green results |
| Is approval required? | Department then Strategy | Department then Strategy |

### Deliver a simple action

Create it from an objective, KPI details, Plans & recovery or the global Create menu. For a direct objective action, choose its responsible department; a KPI action inherits the KPI department.

Enter the task, owner, due date, priority and expected outcome. Save, then submit for approval. After final approval, start delivery from **Manage plan**, record progress and complete any checklist items with evidence. Request closure with delivery evidence; both review stages must approve completion. A Green KPI or recovery monitoring review is not required for an action plan.

### Create and submit recovery

All recovery entry points use the same form:

| Entry point | KPI selection |
| --- | --- |
| Plans & recovery → Create recovery plan | Choose a current eligible KPI |
| Global Create → Create recovery plan | Choose a current eligible KPI |
| Impact & escalation → Create recovery plan | Uses the selected current underperforming KPI |
| KPI details → Create recovery plan | Uses the selected current underperforming KPI |

Only current published Amber/Red KPIs qualify. Healthy KPIs, missing actuals, drafts and historical details do not initiate recovery. The chooser links any existing open recovery plans; more than one plan may be created.

1. Review the read-only actual/target gap and strategic context.
2. Confirm the title, accountable owner, deadline, priority and expected outcome.
3. Enter the root cause, corrective steps and next review date.
4. Select **Create & submit for approval**.

This creates one Open plan and immediately starts Department review, followed by Strategy review. Corrective steps initialize the first milestone; success criteria, review owner and cadence are prefilled. The creation trigger is retained even if later actuals or targets change. There is no second initial submission step in Manage plan.

Use **Save draft** only when the initial recovery detail is unfinished. It creates no approval request. Complete the missing detail and milestones in Manage plan, then submit. Basic plan details are still required for a draft.

### Manage approved recovery

While review is pending, Manage plan displays the request stage and locks edits/execution. After both approvals:

1. Select **Start recovery**.
2. Record progress notes and complete milestones with evidence.
3. Record a monitoring review as **Monitoring**, **Blocked** or **Effective**.
4. Supply findings/evidence and a future next-review date. A Blocked assessment also needs the blocker/intervention.
5. When all closure gates are met, provide recovery evidence and select **Verify recovery & close** to request closure approval.

An Effective review requires completed, evidenced milestones and the configured consecutive Green KPI periods, default two. Closure also requires the review to match the current plan/results and not be due for renewal. New results, approved targets, milestone/plan revisions or changed recovery policy can invalidate prior verification.

Changing approved scope, ownership, deadlines, corrective detail or milestone structure creates an amendment request; the approved plan remains active until final approval. Routine progress, milestone completion/evidence and monitoring are audited without another plan-approval cycle.

Closed plans retain their evidence snapshot. Reopening requires a reason and both approvals; recovery then needs fresh effectiveness verification.

## Review and track approvals

Open **Approvals → My review** for decisions assigned by your role and department. Other filters show your submissions, pending requests and completed decisions. Review the proposed/current values and provide a decision note, then approve or return for changes.

Department Approver decides the first stage. Strategy Team decides the second stage. Nobody can approve their own request. If the requester is the department's only approver, an administrator must assign another eligible account. Administrators cannot approve as a substitute.

Returned requests can be revised and resubmitted. Pending requests prevent conflicting changes; stale versions cannot be approved. Deadlines flag overdue work without automatically deciding it.

Execution status and review stage are separate: an **Open** plan may be Draft, awaiting Department/Strategy review or already Approved. Final approval does not start delivery automatically. The board's Recovery verified indicator is Green-period readiness, not confirmation that every closure gate and decision is complete.

## Use AI insights and connected navigation

Try a KPI name/ID, objective, plan title, source name, approval ID, or “How does ITQAN IQ work?”. The guide searches permitted goals, objectives, draft/published KPIs, plans, sources, approvals and audit updates. Results link to the relevant record or screen. The top-bar search uses the same guide.

The guide uses local rules and workspace records. It does not contact an AI model or change data. Follow the goal → objective → KPI → plan path in record drawers, use **Back** to return, and clear linked filters on the registry/plan board to widen your view.

Impact & escalation defaults to **Needs attention**. **All KPIs** also exposes healthy KPI context and simple actions. Escalation roles are advisory; no external message is dispatched.

## Open Administration

Sign out, select **Administrator**, choose **Workspace administrator**, and enter. Administration opens automatically and has sidebar/top-bar shortcuts. The direct route is `#/admin`.

Its ten sections cover Organization, Strategy & objectives, Lists of values, Departments, Users & roles, Performance rules, Approval policy, Plan & recovery defaults, Notifications and Source systems. See [Configuration](CONFIGURATION.md) for supported values and effects.

## Reports, notifications and saved work

CSV export includes published KPIs in the authorized reporting scope. The executive performance pack opens the browser print view; choose Save as PDF in the print dialog if needed. Draft KPIs are excluded from performance exports.

In-app notifications link to eligible decisions, returned submissions, due reviews and configured performance items. The indicator is not a persistent unread counter. Audit trail shows local activity within your role's scope.

A refresh retains saved records and settings in this browser origin. Another profile, host or port has separate data. The reporting calendar is fixed to April–September 2026; it does not roll forward automatically.

## Common situations

| Situation | What to check |
| --- | --- |
| Administration is absent | Enter the Administrator demo account |
| Recovery creation is unavailable | Check current Amber/Red actuals, KPI publication, write permissions and active department/linked filters |
| New recovery is Open after submission | Open is its execution status; inspect the Department/Strategy review badge |
| Start or editing is locked | Complete both approvals; resolve any pending request |
| Effective review/closure is blocked | Check milestones/evidence, Green-period window, current review date and changed plan/results |
| A source has no live updates | Source settings are catalogue details; ingestion is not connected |
| Work is missing from a list | Check role scope, department, linked-record and type/status filters |
| No matching demo account exists | An Administrator can add/activate an account for that role and department |

## Prototype limits

Live identity/UAE PASS, server authorization, shared storage, actuals ingestion, external notifications, connected AI and attachment storage are not implemented. Browser-local scope and approvals demonstrate intended behavior; they are not production security controls. Some Arabic administration/approval copy remains English.

For detailed rules use the [functional specification](FUNCTIONAL_SPECIFICATION.md), for process diagrams use [Workflows](WORKFLOWS.md), and for remaining service work use [Integrations](INTEGRATIONS.md).
