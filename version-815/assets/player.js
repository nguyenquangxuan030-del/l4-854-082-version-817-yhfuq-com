(function () {
  function getConfig() {
    var node = document.getElementById("player-config");
    if (!node) {
      return null;
    }
    try {
      return JSON.parse(node.textContent || "{}");
    } catch (error) {
      return null;
    }
  }

  function initPlayer() {
    var config = getConfig();
    var video = document.getElementById("movie-video");
    var cover = document.getElementById("player-cover");
    if (!config || !config.stream || !video || !cover) {
      return;
    }
    var ready = false;
    var hls = null;

    function bindStream() {
      if (ready) {
        return;
      }
      ready = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          autoStartLoad: true,
          capLevelToPlayerSize: true,
          maxBufferLength: 30
        });
        hls.loadSource(config.stream);
        hls.attachMedia(video);
      } else {
        video.src = config.stream;
      }
    }

    function start(event) {
      if (event) {
        event.preventDefault();
      }
      cover.classList.add("is-hidden");
      bindStream();
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          cover.classList.remove("is-hidden");
        });
      }
    }

    cover.addEventListener("click", start);
    cover.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        start(event);
      }
    });
    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hls && typeof hls.destroy === "function") {
        hls.destroy();
      }
    });
  }

  document.addEventListener("DOMContentLoaded", initPlayer);
})();
