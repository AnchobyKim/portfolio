const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function applyMediaPreference(event = reducedMotion) {
  if (!event.matches) return;

  document.querySelectorAll('video[autoplay]').forEach((video) => {
    video.pause();
    video.removeAttribute('autoplay');
  });
}

applyMediaPreference();
reducedMotion.addEventListener?.('change', applyMediaPreference);
