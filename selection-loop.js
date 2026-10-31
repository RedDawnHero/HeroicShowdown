(() => {
  const music = document.querySelector('#selectionMusic');
  if (!music) return;
  music.defaultPlaybackRate = 1.08;
  music.playbackRate = 1.08;
  music.preservesPitch = true;
  // The uploaded recording fades out here, then contains about 5.6s of silence.
  const loopEnd = 41.42;
  let timer;
  function scheduleLoop() {
    clearTimeout(timer);
    if (music.paused || music.ended) return;
    if (music.currentTime >= loopEnd) music.currentTime = 0;
    timer = setTimeout(scheduleLoop, Math.max(10, (loopEnd - music.currentTime) * 1000 / music.playbackRate));
  }
  ['playing', 'seeked', 'ratechange', 'timeupdate'].forEach(event => music.addEventListener(event, scheduleLoop));
  music.addEventListener('pause', () => clearTimeout(timer));
  music.addEventListener('ended', () => clearTimeout(timer));
  window.addEventListener('pagehide', () => clearTimeout(timer));
})();
