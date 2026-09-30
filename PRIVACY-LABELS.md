# App Store privacy labels

What to select in App Store Connect → App Privacy. Each entry below is derived
from what the code actually stores, not from what the feature sounds like.
Re-check this file against the code before changing an answer — an inaccurate
label is a review problem and a trust problem.

Apple asks three things per data type: is it **collected**, is it **linked to
the user**, and is it used for **tracking**.

**Tracking is "No" for every type below.** Unpact does not share data with data
brokers, does not use it for advertising, and does not combine it with data from
other companies' apps or sites. There is no advertising SDK and no analytics SDK
in the build.

## Collected and linked to the user

| Data type | Category | Purpose | Why |
| --- | --- | --- | --- |
| Name | Contact Info | App Functionality | Account creation |
| Email Address | Contact Info | App Functionality | Account identity and sign-in |
| Audio Data | User Content | App Functionality | Recordings attached to finished memos older than 14 days are removed when capture history is opened |
| Other User Content | User Content | App Functionality | Transcripts, tasks, habits, plans, lists, research answers |
| **Other Data Types** | Other Data | App Functionality | **Calendar commitments — times and titles only** |
| Purchase History | Purchases | App Functionality | Subscription status via RevenueCat |
| Product Interaction | Usage Data | App Functionality | Monthly counts of captures, research runs and plans, to enforce free limits |
| User ID | Identifiers | App Functionality | Account id linking the above |

All of these are linked to identity, because they hang off an account.

## Calendar — the one that needs care

Apple has no dedicated "Calendar" data type in the privacy questionnaire, so it
goes under **Other Data → Other Data Types**, which prompts for a free-text
description. Use wording that matches the privacy policy:

> Times and titles of events from the user's calendar, used to plan around
> existing commitments. No attendees, locations, notes, or organisers.

Two things a reviewer may probe, both answered in `privacy.html`:

- **It is read-only.** The app never creates, edits or deletes calendar events.
  On Android `WRITE_CALENDAR` is stripped from the manifest via
  `blockedPermissions`, which is verifiable in the APK.
- **Titles reach the model provider.** When a day is planned, commitment times
  and titles are included in the request so the plan can be built around them.
  This is disclosed under "Service providers".

## Not collected

- Location — never requested.
- Contacts — never requested.
- Health, Financial Info, Browsing History, Search History, Sensitive Info.
- Diagnostics and crash data — no crash-reporting SDK is in the build.
- Advertising Data — there is none.

Payment details are handled entirely by Apple or Google; card numbers never reach our
servers, so **Payment Info is not collected**.

## Before submitting

- [ ] Labels match `privacy.html`; if one changes, change both.
- [ ] Privacy Policy URL is set to `https://unpact.app/privacy.html`.
- [ ] The paywall links to both Terms and Privacy (Guideline 3.1.2) — these are
      in `UpgradeScreen`, and a reviewer will tap them.
- [ ] A review account exists that can get past sign-in **and** the paywall.
      Adding the address to `TESTER_EMAILS` grants unlimited access.
- [ ] No `UIBackgroundModes` is declared (Guideline 2.5.4). The `audio` mode was
      removed once the call graph showed nothing uses it: Siri capture became
      dictation, so `UnpactRecordingManager.start()` has no callers and the
      capture Live Activity is never requested. Do not re-add it without a
      reachable background recorder.

Retention clarification (September 28, 2026): the 14-day history cleanup removes memo rows and recordings, not Capture task-processing records. Those records include a copy of input text and remain until account deletion. This does not assert provider-side deletion.
