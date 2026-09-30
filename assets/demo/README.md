# Native app demonstrations

The website has two media slots: capture in the hero, and mobile Plan beside
the planning explanation. `manifest.json` currently has `null` for both because
no native screen recordings were available in this workspace. The page shows
an explicitly illustrative capture and a text walkthrough of phone planning.
There are no missing video requests, fake native screenshots, or video-shaped
loading placeholders.

## Record from an installed build

Use an isolated demo account with synthetic tasks, turn off unrelated
notifications, and record the actual iPhone/Android app in portrait. Record the
build identifier and distribution URL, not just version `1.0.0` (several test
builds use that version). Keep original recordings outside this repository.

### Capture: target 20-30 seconds

1. Open Capture and speak or type: "Call the dentist, send Sam the receipt,
   and put the bins out tomorrow."
2. Submit the capture and retain its actual saved/processing state in the edit.
3. Open the actual resulting tasks. If the output differs from the script,
   show the output rather than recreating a perfect result for the video.
4. Open the dentist task, change its title to "Call the dentist about a checkup,"
   and save using that build's controls.
5. Complete that task and show the updated list.

If a processing wait is cut, put "Processing wait shortened" visibly in the
edited video and describe the cut in both metadata and the adjacent text. Use
captions for all speech and meaningful actions. Do not show future plan-03
receipt cards or plan-04 Undo controls until users can install that build.

### Plan: target 20-30 seconds

1. Open the Plan tab and a day with room for a demo task.
2. Use the phone's tap-based controls: tap an open time, choose a task, set its
   time/duration, and add it to the plan.
3. Tap the scheduled block, adjust its time or duration, and show the saved result.

If the available build instead requires generating a first plan, show the
actual draft, the user's acceptance, and then an adjustment. Match the written
steps to that recording. Never substitute the desktop drag interaction or a
browser at a phone viewport for native footage.

## Prepare public assets

For each recording, provide a compact H.264 MP4, a still extracted from that
same clip, and English WebVTT captions. Use unique filenames when replacing
an existing recording so cached assets cannot mix old and new footage/captions.
Targets: 720-pixel portrait width, at most 30 fps, ideally under 5 MB per clip;
the verifier allows up to 15 MB for a video and 400 KB for a poster.

Example FFmpeg commands (replace paths and timestamps with the real recording):

```powershell
$demoFfmpeg = 'C:\path\to\ffmpeg.exe'
& $demoFfmpeg -i 'C:\recordings\capture-edited.mov' -map 0:v:0 -map '0:a?' -vf 'scale=720:-2,fps=30' -c:v libx264 -crf 24 -preset medium -pix_fmt yuv420p -c:a aac -b:a 96k -map_metadata -1 -movflags +faststart 'website\assets\demo\capture-build-date.mp4'
& $demoFfmpeg -ss 00:00:15 -i 'website\assets\demo\capture-build-date.mp4' -frames:v 1 -vf 'scale=720:-2' -c:v libwebp -quality 82 'website\assets\demo\capture-build-date-poster.webp'
```

Choose a legible task/result frame for the capture poster and a saved plan
frame for the Plan poster. Do not crop away controls needed to understand the
interaction. Inspect the whole recording and still for personal information.

Write caption cues against the **edited** video's timing. Caption spoken input
verbatim, and describe meaningful silent actions. The video also needs a full
text equivalent in `description` and `steps`; captions alone are insufficient
when the visitor cannot play the video.

## Integrate a recording

Replace the relevant `null` in `manifest.json` with an entry using this shape.
The strings below describe the intended format; use actual values from the
recording. Keep the other entry `null` if its recording is still unavailable.

```json
{
  "video": "capture-build-date.mp4",
  "poster": "capture-build-date-poster.webp",
  "captions": "capture-build-date.en.vtt",
  "width": 720,
  "height": 1560,
  "durationSeconds": 28,
  "title": "Capture, edit, and complete",
  "posterAlt": "The three demo tasks in the Android Tasks screen.",
  "description": "A thought becomes three editable tasks. The dentist task is renamed and completed.",
  "steps": [
    "Capture: Call the dentist, send Sam the receipt, and put the bins out tomorrow.",
    "Wait for processing, then open the three resulting tasks.",
    "Rename the dentist task to Call the dentist about a checkup and save it.",
    "Complete the dentist task and return to the remaining tasks."
  ],
  "recording": {
    "platform": "Android",
    "build": "ACTUAL DISTRIBUTED BUILD IDENTIFIER",
    "recordedAt": "YYYY-MM-DD",
    "releaseUrl": "https://github.com/jaygrth94/unpact-releases/releases/tag/ACTUAL-TAG",
    "edits": "Describe cuts, changed playback speed, captions, and audio edits; write None only if unedited."
  }
}
```

From the repository root:

```powershell
node website/scripts/sync-demo-media.mjs
node website/scripts/sync-demo-media.mjs --check
node --test website/scripts/demo-media.test.mjs
node website/verify-responsive.mjs
```

The sync command validates local assets, caption timing, and required provenance,
then changes only the two marked media slots in `index.html`. It is a preparation
step, not a runtime dependency or deployment command. The site remains static.
Set an entry back to `null` and run sync to restore its text example. Editing the
page outside the media markers does not get overwritten.

The helper validates supplied metadata; it cannot establish that a video is
native, faithful, or cleared of personal content. Watch the source recording
and compare it with the stated build before treating it as marketing proof.

## Playback and release checks

- Native browser controls, inline playback, `preload="none"`, fixed dimensions,
  a poster, and a default caption track are generated. Playback never starts
  automatically. There is no user-agent redirect or analytics collection.
- Text descriptions are always available. With JavaScript enabled, a failed
  media request reveals the still and expanded steps. Without JavaScript, the
  native player and text remain usable. Only one demo plays at a time.
- Verify in mobile Safari, Android Chrome, and desktop: play/pause/seek/fullscreen,
  captions, keyboard controls, reduced motion, blocked media, and slow loading.
  Verify actual frame dimensions and caption timing; the manifest is not a codec
  probe. Check that the CTA is usable before any video downloads.
- Check the installed build associated with each public download/enrollment
  link. A successful HTTP response does not prove installation or authentication.
- Capture new footage after plans 03/04 ship and refresh these entries with
  that build's provenance. Refresh the poster, captions, text, and video together.

Current distribution evidence lives in `../../CAPABILITIES.md`. A browser CTA
must wait until the final origin's HTTPS, authentication, and task access work.
