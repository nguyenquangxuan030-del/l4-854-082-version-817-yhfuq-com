
import { H as Hls } from './hls.js';

export function initMoviePlayer(videoUrl, posterUrl) {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  var status = document.querySelector('[data-player-status]');
  var hls = null;

  if (!video) {
    return;
  }

  video.poster = posterUrl;

  function setStatus(text) {
    if (status) {
      status.textContent = text || '';
    }
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  }

  function showOverlay() {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  }

  function startVideo() {
    hideOverlay();
    setStatus('');
    var request = video.play();

    if (request && typeof request.catch === 'function') {
      request.catch(function () {
        showOverlay();
      });
    }
  }

  function toggleVideo() {
    if (video.paused) {
      startVideo();
    } else {
      video.pause();
      showOverlay();
    }
  }

  if (Hls && Hls.isSupported()) {
    hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });
    hls.loadSource(videoUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.ERROR, function (event, data) {
      if (data && data.fatal) {
        setStatus('播放暂时无法加载，请稍后重试');
      }
    });
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = videoUrl;
  } else {
    setStatus('当前浏览器暂不支持在线播放');
  }

  if (overlay) {
    overlay.addEventListener('click', startVideo);
  }

  video.addEventListener('click', toggleVideo);
  video.addEventListener('play', hideOverlay);
  video.addEventListener('pause', showOverlay);
  video.addEventListener('ended', showOverlay);

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}
