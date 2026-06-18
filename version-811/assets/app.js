(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector(".mobile-nav");
    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      var open = nav.hasAttribute("hidden");
      if (open) {
        nav.removeAttribute("hidden");
      } else {
        nav.setAttribute("hidden", "");
      }
      toggle.setAttribute("aria-expanded", String(open));
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function play() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        play();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        play();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        play();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", play);
    show(0);
    play();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupSearch() {
    var searchInput = document.querySelector("[data-movie-search]");
    var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
    if (!searchInput || !cards.length) {
      return;
    }

    var filters = Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));
    var clearButtons = Array.prototype.slice.call(document.querySelectorAll("[data-search-clear]"));
    var emptyStates = Array.prototype.slice.call(document.querySelectorAll("[data-empty-state]"));

    function matches(card) {
      var keyword = normalize(searchInput.value);
      var title = normalize(card.getAttribute("data-title"));
      var genre = normalize(card.getAttribute("data-genre"));
      var region = normalize(card.getAttribute("data-region"));
      var year = normalize(card.getAttribute("data-year"));
      var ok = !keyword || title.indexOf(keyword) >= 0 || genre.indexOf(keyword) >= 0 || region.indexOf(keyword) >= 0 || year.indexOf(keyword) >= 0;

      filters.forEach(function (filter) {
        var type = filter.getAttribute("data-filter");
        var value = normalize(filter.value);
        if (!value) {
          return;
        }
        var target = normalize(card.getAttribute("data-" + type));
        if (target.indexOf(value) === -1) {
          ok = false;
        }
      });

      return ok;
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var show = matches(card);
        card.hidden = !show;
        if (show) {
          visible += 1;
        }
      });
      emptyStates.forEach(function (state) {
        state.hidden = visible !== 0;
      });
    }

    searchInput.addEventListener("input", apply);
    filters.forEach(function (filter) {
      filter.addEventListener("change", apply);
    });
    clearButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        searchInput.value = "";
        filters.forEach(function (filter) {
          filter.value = "";
        });
        apply();
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    if (!players.length) {
      return;
    }

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var playButton = player.querySelector(".player-play");
      if (!video || !playButton) {
        return;
      }

      var src = video.getAttribute("data-hls");
      var loaded = false;
      var hls = null;

      function loadAndPlay() {
        if (!src) {
          return;
        }

        if (!loaded) {
          if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true,
              backBufferLength: 90
            });
            hls.loadSource(src);
            hls.attachMedia(video);
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
          } else {
            video.src = src;
          }
          loaded = true;
        }

        player.classList.add("is-playing");
        video.play().catch(function () {
          player.classList.remove("is-playing");
        });
      }

      playButton.addEventListener("click", loadAndPlay);
      video.addEventListener("click", function () {
        if (video.paused) {
          loadAndPlay();
        }
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          player.classList.remove("is-playing");
        }
      });
      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });
      video.addEventListener("ended", function () {
        player.classList.remove("is-playing");
      });
      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupPlayers();
  });
})();
