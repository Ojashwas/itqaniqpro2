# Administration and configuration

## Open Administration

Sign out, choose the **Administrator** role and the **Workspace administrator** account, and enter the workspace. Administration opens automatically for administrators. It is also available in the sidebar and top bar, with the direct route `http://localhost:5180/#/admin`. Login ID/password and UAE PASS are visible sign-in options awaiting live identity integration; see [Login experience](LOGIN.md).

Other roles cannot save admin settings through the application. The account picker is a demonstration; production authentication and server authorization are still required.

## Settings and effects

| Section | Configurable values | Effect |
| --- | --- | --- |
| Organization | Organization name, strategy label, default language and default landing page | Labels update across the app; language/landing defaults apply at next sign-in; admins always land in Administration |
| Strategy & objectives | Create/edit parent strategic goals and child objectives, owners and responsible departments | The same hierarchy editor is available to Strategy Team on the strategy screen; references are preserved |
| Lists of values | KPI types, units, priorities, recovery review frequency and source refresh frequency | New forms use enabled values; existing values and pending approvals remain valid; defaults cannot be disabled while selected |
| Departments | Add department and accountable owner | Adds account-assignment and registration scope; shows approver coverage |
| Users & roles | Name, email, assigned role, department, active status | Updates simulated access and reviewer eligibility; self-removal of admin access is prevented |
| Performance rules | Aggregate Green and Amber boundaries | Reclassifies aggregate status and parent-goal escalation, including historical views; does not change KPI targets or actuals |
| Approval policy | Review window per stage | Sets deadlines for new submissions and newly started stages; retains existing stage deadlines |
| Plan & recovery defaults | Green-period requirement, cadence, priority, deadline | Recovery policy affects current recovery closure eligibility; cadence applies to recovery monitoring; priority/deadline apply to both plan types |
| Notifications | Approval, monitoring and performance categories | Controls in-app notification content and indicator, while work remains available in its own screens |
| Source systems | Add source system; source owner/team and expected refresh cadence | Maintains the source catalogue and displays settings in Data flows; does not connect a source |

See [Connected workspace](WORKSPACE_FLOWS.md#configurable-lists) for supported values and historical retention. Security roles, lifecycle states and approval stages retain their defined system behavior.

## Defaults and validation

| Setting | Default | Allowed values |
| --- | --- | --- |
| Aggregate Green / Amber | 95% / 85% | `0 <= Amber < Green <= 100` |
| Approval review window | 3 days | 1–30 whole days per stage |
| Recovery Green periods | 2 | 2–6 consecutive sample periods |
| Recovery review cadence | Weekly | Weekly, Fortnightly, Monthly |
| Plan priority | Medium | High, Medium, Low |
| Plan deadline | 14 days from creation | 1–365 whole days |
| Notification categories | All enabled | Each category can be enabled/disabled |
| Default language | English | English or Arabic |
| Default landing page | Executive overview | Overview, strategy, AI insights or KPI registry |

The two-stage approval sequence, no-self-approval rule and required evidence are fixed policies. The configuration screen does not disable those safeguards. KPI measurement units and definitions are set during registration; KPI-specific target changes require business approval.

## Persistence

Settings, framework records and accounts are saved in browser localStorage and configuration changes are audited locally. A recovery-policy change may require a new effectiveness review, while previously approved closure snapshots remain intact. Settings are shared across the simulated roles in the same browser origin; they are not synchronized between users or devices.

Live source credentials, SSO, email delivery, database settings and deployment configuration are not implemented admin controls. See [Integration requirements](INTEGRATIONS.md) for the required production work.
