# Live connection requirements

The local application works with synthetic data and simulated accounts. This document records the remaining production dependencies; it does **not** describe implemented APIs.

## Sign-in and authorization

Provide the identity provider (for example, the organization's existing SSO), tenant/issuer, application registration and approved callback URLs, and the groups or claims identifying department and role. Do not put client secrets in frontend code or send them in chat; use the deployment environment's secret store.

The production backend must derive the account, role and department from the verified session. It must return only authorized department records, apply the same restriction to exports/search/approvals/audits, and recheck permissions on every mutation. Administrator is an account-management role, not a business-approval bypass.

## Incoming KPI actuals

For each source application, provide:

- Application name, API/event/file interface and a sample payload without confidential values.
- Source measure identifier mapped to the application KPI ID.
- Period format, reporting cadence, unit, timezone and correction policy.
- Confidence/validation flag, observation timestamp and source record/version ID.
- Authentication method, approved integration environment and delivery/retry mechanism.

Required observation mapping:

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

This is a proposed mapping, not an active endpoint. Actuals must be written only by the integration identity. Reject invalid units/ranges and unrecognized source-to-KPI mappings; make duplicate deliveries idempotent and preserve corrected versions with provenance. Imported changes must invalidate affected recovery verification while retaining approved closure snapshots. Users set targets; they do not type actuals.

## Hosting and persistent workflow

Confirm the hosting environment, persistent database, retention/backup requirements and permitted notification destinations. Production requires transactional approval decisions, concurrency checks, durable audit records and server-enforced permissions. Requesters cannot approve their own submissions; Department review precedes Strategy review. Closure must revalidate the current plan, milestones, monitoring review and KPI results when the final decision is applied.

Until these integrations are implemented, the browser account picker and localStorage remain a demonstration, not a production authentication or isolation boundary.
