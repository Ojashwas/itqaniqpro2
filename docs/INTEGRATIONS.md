# Integration requirements

**Reviewed: 17 September 2026.** The current application is a local prototype. This document separates implemented connection previews from proposed production contracts; it does not describe available application APIs.

## Current connection status

| Area | Implemented now | Production work remaining |
| --- | --- | --- |
| Organization sign-in | Login ID/password form, show/hide, help and unavailable-connection feedback | Verified identity flow, sessions and account mapping |
| UAE PASS | Visible button/artwork and unavailable-connection feedback | Provider onboarding and authenticated server/callback flow |
| Roles and departments | Demo accounts and scoped UI behavior | Backend authorization for all reads, writes, search and exports |
| Source actuals | Synthetic history, source catalogue, metric keys and read-only Data flows | Authenticated ingestion, validation, corrections, freshness and reconciliation |
| KPI and plan approvals | Local snapshots, two stages, versions and decision history | Shared durable storage, transactions and concurrent-user protection |
| Notifications/escalation | Computed in-app items and advisory escalation roles | Optional external delivery, recipients, retries and delivery tracking |
| AI insights | Deterministic workspace search and application help | Optional connected model/retrieval service with the same access scope |
| Evidence/audit | Text evidence, closure snapshots and local activity | Durable evidence storage, retention, provenance and audit controls |

The Node server serves only allowlisted static assets. There are no authentication, observation-ingestion, approval or AI endpoints.

## Identity and authorization

Production setup needs the organization's identity provider, tenant/issuer, application registration, approved callback URLs and role/department mapping. UAE PASS additionally requires its approved onboarding and integration configuration. Secrets belong in the deployment environment's secret store, not browser code or Administration forms.

The backend must derive the account and role from a verified session. Department roles receive only their department's records; Strategy Team and Administrator may read across departments. Administrator may configure the application but is not a KPI/plan writer or substitute business approver. Strategy Team and Administrator may maintain the hierarchy.

Apply scope consistently to goals/objectives, KPIs, plans, sources, search, approvals, audit, notifications and exports. Recheck authorization on every mutation. Owner names in current records are descriptive; any production restriction to named owners needs an agreed identity mapping and policy.

The demo picker must not be a production path for assigning privileges. Login ID/password and UAE PASS currently do not authenticate, transmit credentials or create provider sessions.

## Incoming actuals and baseline observations

Users register definitions and targets here. Actuals and baseline observations are owned by source applications; they must not gain a manual-entry UI as a substitute for integration.

For each source, agree:

- Source application, owner and interface: API, event stream or file delivery.
- Source measure identifier and its mapping to a published application KPI.
- Reporting period/calendar, unit, timezone, freshness expectation and correction policy.
- Observation and source record/version identifiers, confidence state and timestamps.
- Integration identity, delivery/retry behavior, reconciliation and failure ownership.

A proposed observation mapping is:

```json
{
  "kpiId": "KPI-SRV-002",
  "sourceMeasureId": "service_completion_days",
  "period": "2026-09",
  "actual": 2.8,
  "unit": "days",
  "confidence": "Validated",
  "sourceRecordId": "example-record",
  "sourceVersion": "1",
  "observedAt": "2026-09-17T08:00:00Z"
}
```

The identifiers are illustrative; this is not an active endpoint or an importable UI file. The ingestion service should add its receipt timestamp and verified source identity. Baseline representation and its effective period require an agreed contract; the new-KPI baseline zero currently stored by the prototype is only a placeholder.

| Required behavior | Reason |
| --- | --- |
| Authenticate the integration and verify the source/KPI mapping | Only the authorized source may supply observations |
| Validate publication policy, period, unit, range and confidence | Invalid delivery must not replace approved data |
| Deduplicate by source record/version | Repeated delivery must not create conflicting results |
| Retain corrected observation versions and provenance | Explain why performance changed |
| Define period-close and backdated-correction policy | Preserve historical accountability |
| Recalculate performance and invalidate affected recovery reviews | Old effectiveness evidence must not authorize current closure |
| Preserve approved closure snapshots | Later actuals/targets must not rewrite the approved evidence |
| Show successful-ingestion times and errors from real service events | Catalogue configuration is not proof of synchronization |

KPI `sourceKey` stores the intended metric/field mapping. Published formula/key changes follow Department and Strategy approval. Formula text is descriptive; the prototype does not execute source expressions or calculate incoming measures from raw source records.

The domain's `recordActual` helper validates local test observations; it is not a live adapter or ingestion API. Source refresh settings are expectations, not scheduled jobs. The fixed sample calendar must be replaced by an agreed operational calendar before live period progression.

## Shared workflow and persistence

A production backend needs stable IDs, durable records and transactional request handling. It must preserve the connected goal → objective → KPI → plan model and the distinction between action delivery and KPI recovery.

Approval requirements include one pending request per entity, immutable submitted/current snapshots, base-version checks, decision notes and no self-approval. Department review precedes Strategy review. Recovery **Create & submit for approval** should create the plan and its initial request atomically; an explicit draft should create no request.

Final approval must revalidate permissions, entity version and business constraints before applying a change. Closure must recheck execution state, evidence, milestones and, for recovery, the current Effective review and consecutive Green results. Pending mutations must not overwrite active approved values. Concurrent decisions and retries need idempotent handling.

Storage requirements include backup/recovery, retention, approved closure evidence, audit integrity and migration from legacy objective-index/department-name references. Browser localStorage is not shared or durable operational storage.

## AI guidance and notification extensions

If a connected AI service is introduced, retrieve only records the authenticated user can access. Preserve direct links to supporting records, explain source freshness, and keep navigation/help separate from approved business mutations. The current guide performs no record changes and uses no external model. Model selection, retrieval design, retention and evaluation are future decisions.

If outbound notifications are introduced, agree recipients, channels, escalation ownership, business-day SLA rules, delivery tracking and retry handling. Current stage deadlines only flag overdue work; current escalation roles do not send messages or assign named reviewers. Current notifications have no persisted read/unread state.

## Production decisions and verification

Confirm hosting, database, operational calendar, data residency/retention requirements, identity assignments, source authority and evidence formats before designing production services. These are not existing Administration settings.

Service verification should cover unauthorized department access, failed/duplicate deliveries, observation corrections, concurrent approvals, stale versions, no self-approval, recovery-review invalidation, final closure revalidation and preserved closure evidence. Existing local tests demonstrate business rules, not live integration readiness.

See [Architecture](ARCHITECTURE.md) for current boundaries and [the functional specification](FUNCTIONAL_SPECIFICATION.md#17-production-requirements-limitations-and-open-decisions) for the production requirements and decision catalogue.
