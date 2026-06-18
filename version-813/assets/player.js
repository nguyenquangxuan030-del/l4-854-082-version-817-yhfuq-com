(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function setupPlayer(container) {
    var video = container.querySelector('video');
    var src = container.getAttribute('data-video');
    var loading = container.querySelector('[data-player-loading]');
    var errorBox = container.querySelector('[data-player-error]');
    var toggles = Array.prototype.slice.call(container.querySelectorAll('[data-player-toggle]'));
    var mute = container.querySelector('[data-player-mute]');
    var fullscreen = container.querySelector('[data-player-fullscreen]');
    var hls = null;
    if (!video || !src) {
      return;
    }
    function hideLoading() {
      if (loading) {
        loading.classList.add('is-hidden');
      }
    }
    function showError(message) {
      hideLoading();
      if (errorBox) {
        errorBox.textContent = message;
      }
    }
    function bindSource() {
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, hideLoading);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showError('视频加载失败，请稍后重试');
            try {
              hls.destroy();
            } catch (err) {}
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        video.addEventListener('loadedmetadata', hideLoading, { once: true });
      } else {
        showError('当前浏览器不支持该视频格式');
      }
    }
    function playPause() {
      if (video.paused) {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            showError('播放被浏览器拦截，请再次点击播放');
          });
        }
      } else {
        video.pause();
      }
    }
    toggles.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        playPause();
      });
    });
    video.addEventListener('click', playPause);
    video.addEventListener('play', function () {
      container.classList.add('is-playing');
    });
    video.addEventListener('pause', function () {
      container.classList.remove('is-playing');
    });
    video.addEventListener('canplay', hideLoading);
    if (mute) {
      mute.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        video.muted = !video.muted;
        mute.textContent = video.muted ? '取消静音' : '静音';
      });
    }
    if (fullscreen) {
      fullscreen.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (container.requestFullscreen) {
          container.requestFullscreen();
        }
      });
    }
    bindSource();
    window.addEventListener('beforeunload', function () {
      if (hls) {
        try {
          hls.destroy();
        } catch (err) {}
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(setupPlayer);
  });
})();
