# Public capability matrix

Verify this file against released builds before changing marketing or
onboarding claims. A repository implementation is not the same as a distributed
feature when users have not installed the relevant build.

| Capability | iPhone app | Android app | Browser portal | Windows shell |
| --- | --- | --- | --- | --- |
| Typed capture | Yes | Yes | Yes | Yes |
| In-app voice capture | Yes | Yes | No | No |
| Siri capture | Supported builds | No | No | No |
| Synced tasks, habits, and plans | Yes | Yes | Yes | Yes |
| Mobile tap-based planning | Yes | Yes | N/A | N/A |
| Desktop drag-and-drop planning | N/A | N/A | Yes | Yes |
| Go Deeper | Yes | Yes | Yes | Yes |
| Native reminders and alarms | Supported builds | Supported builds | No | No |
| Native focus presentation | Supported builds | Supported builds | No | No |
| Calendar export (subscribable .ics) | Supported builds | Supported builds | No | No |
| Calendar awareness (plans avoid your commitments) | Supported builds | Supported builds | Reads what a phone synced | No |

Do not replace `Supported builds` with an unconditional `Yes` until the feature
has been device-tested in, and distributed through, the current public release.

The browser portal requires deployment at its final origin before it can be
described as publicly available. PWA installation is not required.

## Distribution checked September 27, 2026

These checks establish link availability, not installation or device validation.

| Surface | Website entry | Evidence / limitation |
| --- | --- | --- |
| Android | Public beta APK | Latest APK download returned HTTP 200. The release page identifies the September 9 test build. Native installation was not exercised in this session. |
| iPhone | Contact support for current access | No public App Store or TestFlight enrollment URL was verified. Retain the existing contact link until a real enrollment link is supplied. |
| Windows | Versioned `v1.0.0` installer | Download returned HTTP 200. The latest-release URL previously returned 404 because that release contains an APK only. Do not describe this older installer as the latest mobile build. |
| Browser | No public CTA | `app.unpact.app` resolves, but the HTTPS request failed during verification; authentication and task access remain unverified. |

Download entries: [Android beta](https://github.com/jaygrth94/unpact-releases/releases/latest/download/Unpact.apk),
[Windows installer](https://github.com/jaygrth94/unpact-releases/releases/download/v1.0.0/Unpact-Setup.exe),
[release notes](https://github.com/jaygrth94/unpact-releases/releases/tag/build-2026-09-09).

## Demonstration status

Pricing, quota, retention and release evidence for the September 28 local
implementation is tracked in [RELEASE-CHECKLIST.md](RELEASE-CHECKLIST.md).
Native offerings and installed-build delivery remain unverified there; do not
promote the local checks into public capability or price claims.

`assets/demo/manifest.json` records the native footage actually integrated into
the homepage. A `null` entry means that text/illustrative content is active;
it is not evidence of a completed recording. See `assets/demo/README.md` for
recording, captions, encoding, and build-provenance requirements.
