(function () {
  function initializeMoviePlayer(source) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var playButton = document.querySelector("[data-player-button]");
    var status = document.querySelector("[data-player-status]");
    var attached = false;

    if (!video || !source) {
      return;
    }

    function setStatus(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function attachSource() {
      if (attached) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus("点击开始播放");
        });
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus("视频加载失败，请稍后再试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        video.addEventListener("loadedmetadata", function () {
          setStatus("点击开始播放");
        }, { once: true });
      } else {
        setStatus("视频暂时无法加载");
      }
    }

    function startPlayback() {
      attachSource();
      video.controls = true;

      if (overlay) {
        overlay.classList.add("is-hidden");
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.addEventListener("canplay", function () {
            video.play().catch(function () {});
          }, { once: true });
        });
      }
    }

    attachSource();
    video.addEventListener("click", startPlayback);

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    if (playButton) {
      playButton.addEventListener("click", function (event) {
        event.stopPropagation();
        startPlayback();
      });
    }
  }

  window.initializeMoviePlayer = initializeMoviePlayer;
})();
