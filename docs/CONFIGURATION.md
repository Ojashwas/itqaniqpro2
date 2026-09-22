# Administration and configuration

**Reviewed: 17 September 2026.** Administration contains ten sections for the shared application configuration. It is available to the **Administrator** role.

## Open Administration

Sign out, choose **Administrator → Workspace administrator → Enter selected workspace**. Administration opens automatically. The sidebar and top bar also provide shortcuts; its route is `http://localhost:5180/#/admin`.

Other roles receive an access explanation on that route. Strategy Team can maintain the strategic hierarchy from Strategy & objectives, but cannot save other administrator settings. Account selection simulates access; it is not production authentication.

## Ten configuration sections

| Section | Available controls | When changes take effect |
| --- | --- | --- |
| Organization | Organization name, strategy/framework label, default language and default landing page | Labels update immediately; sign-in defaults apply at next entry; administrators always land in Administration |
| Strategy & objectives | Create/edit strategic goals and child objectives, names, owners and responsible departments | Saves directly with audit; connected views update while objective/KPI references remain intact |
| Lists of values | KPI types; enabled units, priorities, review cadence and source refresh cadence | New forms use enabled values; saved values remain available for existing records |
| Departments | Add department and accountable owner; inspect account/KPI counts and approver coverage | Available for account assignment, objectives and KPI registration immediately |
| Users & roles | Add/edit name, email, role, department and active status | Affects demo sign-in and current reviewer eligibility |
| Performance rules | Aggregate Green and Amber boundaries | Reclassifies aggregate status and objective-based escalation, including historical views; leaves KPI targets/actuals unchanged |
| Approval policy | Review days per stage; department/Strategy reviewer coverage | New submissions and newly started stages use the setting; existing deadlines remain |
| Plan & recovery defaults | Consecutive Green requirement, review cadence, priority and deadline offset | Green policy affects current recovery verification; other defaults apply to new plans |
| Notifications | Approval, monitoring and performance categories | Recomputes the in-app indicator and notification content; underlying work remains accessible |
| Source systems | Add sources; configure source owner/team and expected refresh | Updates the source catalogue and Data flows; does not connect or schedule ingestion |

## Strategy and department setup

A strategic goal requires a name and owner; Arabic name and description are optional. An objective requires its parent goal, name, owner and responsible department. Multiple objectives may belong to one goal. Goal names are unique case-insensitively; objective names are unique within a parent. Empty goals are allowed during setup. Deletion/reordering is not provided.

Departments require a name and owner, each up to 100 characters. Duplicate names are rejected case-insensitively. The current form adds departments; it does not rename, archive or delete existing ones. The coverage panel shows whether department approvers are available.

Hierarchy changes do not run through KPI/plan approvals. They save directly for Strategy Team or Administrator and are audited locally.

## Accounts and fixed roles

| Role | Data scope | Business responsibility |
| --- | --- | --- |
| Department Contributor | Assigned department | KPI/target proposals, plans and approved delivery |
| Department Approver | Assigned department | The same business writes plus first-stage decisions |
| Strategy Team | All departments | Hierarchy, business writes and final-stage decisions |
| Administrator | All departments | Hierarchy, configuration and accounts; read-only for KPI/plan business work |

Department is required for departmental roles; global roles have no assigned department. Account names and valid unique emails are required. Inactive accounts cannot enter the workspace. An administrator cannot deactivate their own account or remove their own Administrator role.

Review eligibility uses the current active role and request department. Free-text KPI, plan and review owners are accountability labels, not separately authenticated access rules. Ensure another eligible reviewer exists when an approver submits work. There is no custom role designer, invitation delivery, password administration or identity-directory synchronization.

## Configurable lists

| List | Supported values and behavior |
| --- | --- |
| KPI types | Leading/Lagging initially; custom categories allowed; unique case-insensitively, non-empty, up to 60 characters |
| KPI units | Enable supported `%`, `days`, `min`, `count`, `rate`; no arbitrary unit/formula engine |
| Plan priorities | Enable High, Medium, Low |
| Recovery review frequency | Enable Weekly, Fortnightly, Monthly |
| Source refresh frequency | Enable Daily, Weekly, Monthly |

At least one value must remain in each list. Change an active plan default before disabling it. Existing records retain saved values in edit controls. Retired KPI types remain known internally so historical definitions and pending approvals are not invalidated. Disabling a value does not rewrite existing records.

Plan types, execution statuses, approval stages, roles, measurement directions and the monthly reporting calendar keep fixed system meanings. This screen is not a workflow designer.

## Policy defaults and validation

| Setting | Default | Allowed values |
| --- | --- | --- |
| Aggregate Green / Amber | 95% / 85% | `0 <= Amber < Green <= 100` |
| Approval review window | 3 days | 1–30 whole calendar days per stage |
| Recovery Green periods | 2 | 2–6 consecutive sample periods |
| Recovery review cadence | Weekly | Enabled Weekly, Fortnightly or Monthly |
| Plan priority | Medium | Enabled High, Medium or Low |
| New-plan deadline | 14 days from creation | 1–365 whole days |
| Notification categories | All enabled | Independently enabled/disabled |
| Default language | English | English or Arabic |
| Default landing page | Executive overview | Overview, Strategy, Ask IQ or KPI registry |

Aggregate scoring policy does not replace an individual KPI's target/Amber pair. The fixed calculation weights are equal KPIs within an objective, equal measured objectives within a strategic goal and equal measured strategic goals overall.

Review frequency initializes new recovery plans. Priority and deadline initialize both action and recovery plans. Changing these defaults does not rewrite existing plans. Changing the Green-period requirement affects current recovery readiness and may invalidate an effectiveness review; approved closure snapshots remain intact.

The two-stage sequence, no-self-approval rule, decision notes and closure evidence are fixed. Configuration cannot disable these gates. Approval deadlines flag overdue work without auto-approval, reassignment or external delivery.

Organization/framework labels are descriptive. Changing a strategy year in the label does not alter the fixed April–September 2026 reporting calendar.

## Source catalogue and mapping

Sources may be added before KPI registration. Registration offers known source names as suggestions and also accepts another source name, which becomes discoverable through the KPI catalogue. Data flows displays published, scoped KPI mappings; a configured source without a published KPI does not yet have incoming KPI results there.

A source profile stores owner/team and expected refresh. The optional source metric/field key belongs to the KPI definition; Data flows falls back to the KPI ID when no key was provided. Published formula/key amendments need Department then Strategy approval.

Source settings do not configure endpoints, credentials, connection tests, retries or scheduled imports. Expected refresh is independent of the fixed monthly KPI measurement frequency. There is no actual-entry configuration.

## Notifications, persistence and audit

Notification categories control computed in-app items within the signed-in account's scope. Turning a category off does not remove its requests, reviews or KPIs. The indicator is not a saved unread/read count, and closing the notification drawer does not mark tasks read.

Settings, accounts and hierarchy changes persist in browser localStorage and are audited locally. All simulated accounts on one origin share the configuration; other devices/profiles do not. No backend deployment settings or secrets are configured here.

See [Architecture](ARCHITECTURE.md) for storage and [Integrations](INTEGRATIONS.md) for production connections. The [functional specification](FUNCTIONAL_SPECIFICATION.md#11-administration-and-application-configuration) contains detailed administration requirements.
