// Native controls work without this enhancement. Text descriptions remain
// available even when scripts, media, or caption requests cannot load.
const demoVideos = [...document.querySelectorAll('[data-demo] video')];

for (const video of demoVideos) {
  const demo = video.closest('[data-demo]');
  const transcript = demo.querySelector('[data-demo-transcript]');
  const status = demo.querySelector('[data-demo-error]');
  const still = demo.querySelector('[data-demo-still]');

  const showFallback = () => {
    const hadFocus = document.activeElement === video;
    video.pause();
    video.hidden = true;
    if (still) still.hidden = false;
    if (status) status.hidden = false;
    if (transcript) {
      transcript.open = true;
      if (hadFocus) transcript.querySelector('summary')?.focus();
    }
  };

  video.addEventListener('error', showFallback);
  for (const source of video.querySelectorAll('source')) {
    source.addEventListener('error', showFallback);
  }
  for (const track of video.querySelectorAll('track')) {
    track.addEventListener('error', () => {
      if (transcript) transcript.open = true;
    });
  }
  video.addEventListener('play', () => {
    for (const other of demoVideos) {
      if (other !== video) other.pause();
    }
  });
  if (video.error) showFallback();
}
