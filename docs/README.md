# ITQAN IQ documentation

**Reviewed: 17 September 2026.** These documents describe the current application: strategic goals → objectives → KPIs → action/recovery plans → approvals → delivery and monitoring. Production requirements are identified separately from working prototype behavior.

`docs/` is the canonical documentation folder. If an editor still has tabs under `doc/`, reopen the corresponding files from this folder.

## Reading guide

| Document | Audience and contents |
| --- | --- |
| [Functional specification](FUNCTIONAL_SPECIFICATION.md) | Business owners and testers: detailed screen requirements, permissions, fields, validations, calculations and acceptance scenarios |
| [User guide](USER_GUIDE.md) | End users: sign-in, strategic setup, KPI registration, approvals, action delivery and recovery monitoring |
| [Connected workspace](WORKSPACE_FLOWS.md) | Product/design teams: screen responsibilities, record links, shared recovery entry points and configurable lists |
| [Workflows](WORKFLOWS.md) | Process owners: submission, two-stage approval, execution, amendments, monitoring, closure and reopening |
| [Configuration](CONFIGURATION.md) | Administrators: all ten sections, list values, defaults, validation and when changes take effect |
| [Login experience](LOGIN.md) | Product/design teams: UAE identity, visible roles, credentials, UAE PASS, responsive layout and connection status |
| [Architecture](ARCHITECTURE.md) | Developers: runtime, files, routes, information model, persistence and authorization boundaries |
| [Development](DEVELOPMENT.md) | Contributors: installation, commands, checks, change placement and documentation maintenance |
| [Integrations](INTEGRATIONS.md) | Integration owners: current connection status and proposed identity, actuals, workflow and AI service requirements |

For installation and the directory tree, see the [project README](../README.md). For the exact approval and recovery gates, use Sections 7–9 of the functional specification.

## Current functional baseline

- Strategic goals contain multiple objectives. Objectives connect to registered KPIs and may also have simple action plans without a KPI.
- KPI definitions and current targets follow Department review, then Strategy review. Actuals have no manual-entry form.
- Recovery creation is available only for current published Amber/Red KPIs. Every entry point uses the same form and **Create & submit for approval** action; unfinished work can use **Save draft**.
- **Manage plan** permits execution after approval. Structural amendments, closure and reopening require approval; routine progress/evidence and monitoring are audited.
- Department roles see their department; Strategy Team sees all departments. Administrator manages shared configuration and cannot bypass business approval.
- AI insights is a local search/navigation guide. Identity, source ingestion, a shared backend and a connected AI model are not implemented.
- The login has UAE flag colors, the visible **Intelligence in Performance.** headline, four role cards, Login ID/password and UAE PASS.

## Maintenance

Update the relevant specification requirements, acceptance scenarios and task guides whenever application behavior changes. Keep implemented behavior, proposed contracts and open decisions distinct. Current verification evidence is recorded in the [development guide](DEVELOPMENT.md#verification).

The Markdown guides are tracked. There are no documentation exclusions in `.gitignore`; new documentation is visible in normal Git status. Keep this index and other references synchronized with file additions and deletions.
