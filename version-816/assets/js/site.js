(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");

    if (!toggle || !links) {
      return;
    }

    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener("mouseenter", stop);
    carousel.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initImageFallbacks() {
    var images = document.querySelectorAll("img.cover-img");

    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing-cover");
        var wrap = image.closest(".poster-wrap");

        if (wrap) {
          wrap.classList.add("is-missing-cover");
        }
      });
    });
  }

  function initCategoryFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var grid = document.querySelector("[data-movie-grid]");

    if (!panel || !grid) {
      return;
    }

    var keyword = panel.querySelector("[data-filter-keyword]");
    var year = panel.querySelector("[data-filter-year]");
    var genre = panel.querySelector("[data-filter-genre]");
    var reset = panel.querySelector("[data-filter-reset]");
    var count = panel.querySelector("[data-filter-count]");
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));

    function apply() {
      var keyValue = (keyword.value || "").trim().toLowerCase();
      var yearValue = year.value;
      var genreValue = genre.value;
      var visible = 0;

      cards.forEach(function (card) {
        var search = card.getAttribute("data-search") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var cardGenre = card.getAttribute("data-genre") || "";
        var matchedKeyword = !keyValue || search.indexOf(keyValue) !== -1;
        var matchedYear = !yearValue || cardYear === yearValue;
        var matchedGenre = !genreValue || cardGenre.indexOf(genreValue) !== -1;
        var matched = matchedKeyword && matchedYear && matchedGenre;

        card.classList.toggle("is-hidden-by-filter", !matched);

        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = visible + " 部影片";
      }
    }

    [keyword, year, genre].forEach(function (input) {
      input.addEventListener("input", apply);
      input.addEventListener("change", apply);
    });

    if (reset) {
      reset.addEventListener("click", function () {
        keyword.value = "";
        year.value = "";
        genre.value = "";
        apply();
      });
    }
  }

  function movieCardTemplate(movie) {
    return [
      '<article class="movie-card">',
      '  <a href="' + movie.url + '" class="movie-card-link" aria-label="观看' + escapeHtml(movie.title) + '">',
      '    <div class="poster-wrap poster-ratio" data-title="' + escapeHtml(movie.title) + '">',
      '      <span class="poster-fallback-title">' + escapeHtml(movie.title) + '</span>',
      '      <img class="cover-img" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
      '    </div>',
      '    <div class="movie-card-body">',
      '      <div class="movie-card-meta">',
      '        <span>' + escapeHtml(movie.year) + '</span>',
      '        <span>' + escapeHtml(movie.type) + '</span>',
      '      </div>',
      '      <h3>' + escapeHtml(movie.title) + '</h3>',
      '      <p>' + escapeHtml(movie.oneLine) + '</p>',
      '      <div class="movie-card-foot">',
      '        <span class="rating">★ ' + escapeHtml(movie.rating) + '</span>',
      '        <span>' + escapeHtml(movie.region) + '</span>',
      '      </div>',
      '    </div>',
      '  </a>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initSearchPage() {
    var data = window.MOVIE_SEARCH_DATA;
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var status = document.querySelector("[data-search-status]");
    var results = document.querySelector("[data-search-results]");

    if (!data || !form || !input || !status || !results) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";
    input.value = initialQuery;

    function render(query) {
      var normalized = query.trim().toLowerCase();

      if (!normalized) {
        results.innerHTML = "";
        status.textContent = "请输入关键词开始搜索。";
        return;
      }

      var matched = data.filter(function (movie) {
        return movie.search.indexOf(normalized) !== -1;
      }).slice(0, 120);

      status.textContent = "找到 " + matched.length + " 个相关结果" + (matched.length === 120 ? "（最多显示 120 个）" : "") + "。";
      results.innerHTML = matched.map(movieCardTemplate).join("");
      initImageFallbacks();
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var url = value ? "./search.html?q=" + encodeURIComponent(value) : "./search.html";
      window.history.replaceState(null, "", url);
      render(value);
    });

    input.addEventListener("input", function () {
      render(input.value);
    });

    render(initialQuery);
  }

  ready(function () {
    initNavigation();
    initHeroCarousel();
    initImageFallbacks();
    initCategoryFilters();
    initSearchPage();
  });
})();
