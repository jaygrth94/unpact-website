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

Do not replace `Supported builds` with an unconditional `Yes` until the feature
has been device-tested in, and distributed through, the current public release.

The browser portal requires deployment at its final origin before it can be
described as publicly available. PWA installation is not required.
