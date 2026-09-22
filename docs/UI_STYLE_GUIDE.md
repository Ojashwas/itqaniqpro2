# UI style guide

All eleven workspace views use the Executive Overview palette. Shared tokens and component rules live in `src/styles/main.css`; generated charts in `src/app.js` also consume these tokens.

| Use | Token | Color |
| --- | --- | --- |
| Primary buttons, hero, selected tabs | `--green-deep` | `#0D3A30` |
| Links, focus, positive status | `--green` | `#0D7758` |
| Selected navigation, supporting surfaces | `--green-soft` | `#E8F4EF` |
| Page background | `--bg` | `#F7F5EF` |
| Cards and inputs | `--surface` | `#FFFFFF` |
| Quiet table headers and nested surfaces | `--surface-subtle` | `#FAF9F5` |
| Headings and main text | `--ink` | `#1B322B` |
| Supporting text | `--ink-soft` | `#3A4D46` |
| Secondary labels | `--muted` | `#586761` |
| Borders | `--line` | `#E4E1D6` |
| Gold text on light surfaces | `--gold` | `#8A6D2A` |
| Achievement ring and accents on dark surfaces | `--gold-light` | `#D6C28C` |
| At-risk status | `--amber` / `--amber-soft` | `#8A6210` / `#FBF2E0` |
| Off-track status | `--red` / `--red-soft` | `#A63C34` / `#FBEDEB` |
| Missing or neutral status | `--neutral` / `--neutral-soft` | `#4F5D57` / `#ECEEE9` |
| Chart actuals | `--chart-green` | `#1A8F68` |
| Chart target | `--chart-gold` | `#A8894A` |

Use Manrope for headings and numerical summaries, DM Sans for body text and controls, and Montserrat for the brand. Cards use a 12px radius, controls 8px, and main panel padding 24px (18px on small screens). Preserve status labels alongside color.

Use shared `.panel`, `.metric`, `.filterbar`, `.field`, `.pill`, and `.table-wrap` components for new views. Primary actions and selected tabs use deep green. Keep gold for supporting emphasis; use the lighter gold on dark backgrounds. UAE flag artwork and the UAE PASS button retain their identity colors.

Mobile layouts collapse grids and filters, allow tables to scroll within their containers, and keep long labels wrapping. Directional accents follow RTL. Keyboard focus remains visible and transitions respect reduced-motion preferences.

## UAE identity

The shared shell uses a bilingual Emirates signature, UAE flag accents, warm sand backgrounds, palm green navigation, heritage gold borders and subtle geometric detailing. National identity accents are decorative and do not represent performance status. Amber/red KPI labels keep their established meanings.

Additional tokens: `--uae-green: #00843D`, `--uae-red: #CE2638`, `--uae-black: #141B18`, `--sand: #F7F5EF`, `--sand-deep: #EEE7D5`, `--heritage-gold: #B69A5B`. Gold is used for decoration, with the darker `--gold` retained for readable text. Arabic headings and body copy use Noto Sans Arabic with system fallbacks. No official seal or government affiliation is implied.

## Arabic interface

Arabic is a full workspace language, including administration, source names, seed objectives, plans, approval labels, search prompts and validation feedback. The reviewed `arabicUI` catalogue and `localizeUI` in `src/features/workspace.js` translate presentation text and accessible labels. Option values are frozen before label translation. IDs, data attributes, persisted records, input values and editable text remain canonical.

A saved `itqan-language` preference survives refresh and sign-in; it takes precedence over the configured default after the user explicitly switches language. With no user preference, the configured default applies. English renders from the same original records. New dynamic content is localized by the shared renderer and a guarded mutation observer.

Arabic uses Noto Sans Arabic, natural letter spacing, more line height and RTL navigation and drawers. Email addresses, source metric keys, numeric/date inputs and charts retain LTR handling. Displayed KPI figures use Arabic numerals; form values remain machine-readable. Recovery copy uses the configured number of periods. Ask IQ accepts Arabic help/approval queries and searches translated seed names alongside original record names.

When adding a UI label or message, provide a reviewed Arabic translation in the catalogue or use the existing `t(en, ar)` helper. User-authored narratives remain editable in their original language; this is interface localization, not an automatic document translation service.
