# Login experience

**Reviewed: 17 September 2026.** See the [user guide](USER_GUIDE.md#start-and-sign-in) for entry steps and the [functional specification](FUNCTIONAL_SPECIFICATION.md#33-sign-in-and-sign-out) for AUTH requirements.

The login page has two visible areas: **Choose your role** for working demo access, and organization sign-in with **UAE PASS**, **Login ID**, **Password**, a password visibility toggle, **Forgot password?** and **Sign in**. They appear side by side on desktop; mobile puts role selection first and organization sign-in below. English and Arabic/RTL are available before sign-in.

## Current behavior

This is a sign-in interface preview. Neither organization credentials nor UAE PASS is connected to an identity provider. Submitting credentials shows an explanatory message, clears the password and does not authenticate, transmit or persist the entered credentials. UAE PASS displays its unavailable-connection message without an external redirect or a simulated successful login. Password help explains that recovery is managed by the organization; the preview does not send reset requests.

Demo roles are always visible as four selectable cards:

| Role | Scope and responsibility |
| --- | --- |
| Strategy Team | All departments; hierarchy maintenance, business work and final approvals |
| Department Contributor | Selected department; register KPIs, propose targets and deliver plans |
| Department Approver | Selected department; review submissions and monitor corrective delivery |
| Administrator | All-department read access, hierarchy, configuration and accounts; no KPI/plan business writes or approval bypass |

Choose a role, choose a department for a departmental role, then select a matching active account and **Enter selected workspace**. The account list is filtered by role and department. A scope summary confirms the selected access. If no matching account exists, entry is disabled with an explanation. Switching language retains the preview selection. Role selection does not itself change the current session or assign privileges; entry uses the chosen existing account. Demo access requires no password.

Administrator entry opens Administration automatically, with sidebar and top-bar shortcuts. Other roles use the configured landing page; the configured default language applies on entry. Sign-in clears prior account-specific filters. Sign-out returns to this page without deleting workspace records. Browser storage retains the simulated session; it is not a verified identity token.

Login ID and password are required on the credential form, with limits of 140 and 256 characters. Password starts concealed; Show/Hide reflects the current visibility. Credential submission resets password visibility after clearing the password. Account help explains that role/department assignment belongs to the workspace administrator.

## Production connection

Organization sign-in needs a verified backend/identity-provider flow. UAE PASS requires provider onboarding, registered client configuration, approved redirect URLs, server-side authorization-code handling, callback/state validation and account-to-role mapping. These are not implemented by the new page. Do not embed provider secrets in the frontend or treat the demo picker as authentication.

See [Integration requirements](INTEGRATIONS.md) for the broader production dependencies.

## Design references

The sign-in page carries a UAE flag with its red hoist and green, white and black horizontal bands, a narrow flag-color top accent, red side accent, green/white controls and a dark green/charcoal background. The flag retains its physical orientation in Arabic/RTL. The ITQAN IQ tagline, **Intelligence in Performance.**, is a large headline above role selection; **Clarity. Confidence. Impact.** is the supporting line. The compact brand lockup uses **CONNECTED PERFORMANCE** so the punch line is not reduced to a small subtitle. The headline and country identity remain visible in the initial mobile viewport; role selection is followed by organization sign-in when scrolling. UAE PASS artwork and unavailable-connection behavior are preserved.

The layout uses the UAE PASS-first ordering from the [UAE design system login pattern](https://designsystem.gov.ae/login). The fingerprint artwork in `public/assets/uae-pass.svg` is extracted from that official pattern and retained without alteration. The black button and wording follow the published [UAE PASS button guidance](https://docs.uaepass.ae/guidelines/design-guidelines/button-guidelines). This use is not a claim of provider onboarding, certification or production approval.

## Verification

Regression tests cover credential validation, password visibility and clearing, absence of credential storage, unavailable-provider messages, role/department/account filtering, unavailable accounts, mismatched submission rejection, language switching and correct workspace entry. Prior headless Chrome checks cover 1440, 1024, 768, 390 and 320 CSS-pixel widths, including Arabic/RTL at 1440 and 390, without horizontal overflow. These are layout checks, not provider certification or a complete accessibility review; this documentation revision does not claim new rendered tests.
