(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setStatus(player, message) {
    var status = player.querySelector("[data-player-status]");

    if (status) {
      status.textContent = message;
    }
  }

  function initPlayer(player) {
    var video = player.querySelector("video");
    var src = player.getAttribute("data-video-src");
    var poster = player.getAttribute("data-poster");
    var bigButton = player.querySelector(".player-big-button");
    var playButton = player.querySelector("[data-player-play]");
    var muteButton = player.querySelector("[data-player-mute]");
    var fullscreenButton = player.querySelector("[data-player-fullscreen]");
    var hlsInstance = null;
    var isPrepared = false;

    if (!video || !src) {
      setStatus(player, "缺少播放源");
      return;
    }

    if (poster) {
      video.setAttribute("poster", poster);
    }

    function prepare() {
      if (isPrepared) {
        return;
      }

      isPrepared = true;
      setStatus(player, "正在加载视频源");

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hlsInstance.loadSource(src);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setStatus(player, "视频已就绪");
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            setStatus(player, "视频加载失败，请稍后重试");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", function () {
          setStatus(player, "视频已就绪");
        });
      } else {
        setStatus(player, "当前浏览器不支持 HLS 播放");
      }
    }

    function togglePlay() {
      prepare();

      if (video.paused) {
        video.play().then(function () {
          player.classList.add("is-playing");
          setStatus(player, "正在播放");
        }).catch(function () {
          setStatus(player, "浏览器阻止了自动播放，请再次点击播放");
        });
      } else {
        video.pause();
        player.classList.remove("is-playing");
        setStatus(player, "已暂停");
      }
    }

    function toggleMute() {
      video.muted = !video.muted;
      setStatus(player, video.muted ? "已静音" : "已取消静音");
    }

    function toggleFullscreen() {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (player.requestFullscreen) {
        player.requestFullscreen();
      }
    }

    if (bigButton) {
      bigButton.addEventListener("click", togglePlay);
    }

    if (playButton) {
      playButton.addEventListener("click", togglePlay);
    }

    if (muteButton) {
      muteButton.addEventListener("click", toggleMute);
    }

    if (fullscreenButton) {
      fullscreenButton.addEventListener("click", toggleFullscreen);
    }

    video.addEventListener("click", togglePlay);
    video.addEventListener("pause", function () {
      player.classList.remove("is-playing");
    });
    video.addEventListener("play", function () {
      player.classList.add("is-playing");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(function () {
    var players = document.querySelectorAll(".js-player");
    players.forEach(initPlayer);
  });
})();
