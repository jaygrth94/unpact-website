# Pricing and trust release record

Updated September 28, 2026. These are local implementation checks, not evidence
that a new mobile build, Windows installer or website has been published.

## Verified product facts

| Item | Evidence | Public wording |
| --- | --- | --- |
| Free allowances | `backend/app.py` and 18 isolated tests in `backend/tests/test_monthly_quotas.py`, including ordinary non-Pro accounts | 20 voice/typed captures, 3 research runs, 5 generated day plans per calendar month |
| Manual work | Task/habit creation and schedule editing use separate unmetered routes; browser/Electron fixture checks title-only manual creation | Manually add/edit tasks, manage habits and edit an existing schedule on Free |
| Captures versus tasks | One accept response can contain several tasks and habits | One capture can create several tasks; the allowance is not a task-storage limit |
| Paid name | Website, Profile, Upgrade; existing `subscriptions.js` entitlement remains `Unpact Pro` | Free / Unpact Pro; Pro removes the three monthly limits |
| Signup | Email signup and social entry do not collect payment details or enroll a trial; browser checks use fixtures | No card required to start; no trial countdown |
| Store amount | `storeOffer.js` uses RevenueCat product priceString, currencyCode and subscriptionPeriod; unknown values cannot produce a purchase button | Start free. See Pro pricing in the app. No unverified numeric offer |
| Research | Existing task research sections expose sources, outcome and recovery warnings | Optional research with source links; verify important information; no “every claim” guarantee |
| Memo retention | `_purge_expired_memos` runs when `/api/memos` is listed and skips active processing | Finished memos older than 14 days are removed when history opens; not an exact scheduled deletion |
| Retained input | `Capture.raw_input` is separate from the removed memo and remains with the account | The memo cleanup window does not erase task-processing input text or specify provider retention |

No entitlement identifier, product ID, quota policy, payment provider or backend
contract changed for these phases. `privacy.html`, `terms.html` and
`PRIVACY-LABELS.md` received factual consistency corrections only.

## Local verification

- `mobile/`: both Node suites (387 root tests and 33 planning tests); web export.
- `mobile/`: `npm run verify:onboarding-web` covers first use, capture results,
  details disclosure, same-task Undo after navigation, failed Undo/retry, short
  screens, manual task creation/cancellation, server quotas and usage failure.
- `desktop/`: `npm run verify:shared-app` exercises the actual Electron server,
  CSP and preload with the same editor/Undo/pricing fixture in an isolated hidden
  window. It does not validate a packaged installer or a live account.
- Website: responsive guard covers all five pages at ten viewport sizes.
- No live model, store purchase, customer account or provider was used.

## Required before publishing a numeric offer or a native release

| Platform | Build/version | Region/currency | Price and billing period | Status |
| --- | --- | --- | --- | --- |
| iOS | Record installed build | Record store region | Record actual offering | Not verified in this session |
| Android | Record installed build | Record store region | Record actual offering | Not verified in this session |

- [ ] Verify offering loading and unavailable states, cancellation, sandbox
  purchase, restore with/without entitlement, account switching, and backend
  entitlement refresh on each installed native build.
- [ ] Verify Restore, Manage/cancel, Terms, Privacy and support links on Free,
  Pro and unavailable-offering screens. Confirm local price and period match
  the native checkout before putting a numeric amount on the website.
- [ ] Check small/large iPhone and Android, larger system text, VoiceOver/TalkBack,
  every nested picker, title/notes edits, keyboard/backdrop/drag/hardware-back
  exits, new-item cancellation, task/habit conversion and occurrence editing.
- [ ] Verify completion/Undo in Tasks, Item Sheet, Today, Plan and Focus on
  devices; future and elapsed reminders; denied permissions; ordinary alarms;
  Android external Clock guidance; and unchanged recurring Habit delivery.
- [ ] Test the packaged Windows build and recheck distribution links. Update
  `CAPABILITIES.md` with actual tested build identifiers and dates.
- [ ] Native screenshots/footage remain subject to the separate demo manifest
  in `assets/demo/`; fixtures are not real-device footage.

Until native price evidence is recorded, retain “See Pro pricing in the app.”
Existing installed apps require new builds to receive these changes; there is
no OTA update channel.
