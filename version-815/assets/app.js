(function () {
  function selectAll(selector, scope) {
    return Array.prototype.slice.call((scope || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function initMenu() {
    var button = document.querySelector(".mobile-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector(".hero-carousel");
    if (!hero) {
      return;
    }
    var slides = selectAll(".hero-slide", hero);
    var dots = selectAll(".hero-dot", hero);
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
        dot.setAttribute("aria-current", dotIndex === index ? "true" : "false");
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        window.clearInterval(timer);
        show(dotIndex);
        start();
      });
    });

    start();
  }

  function initCategoryFilter() {
    var panel = document.querySelector("[data-filter-panel]");
    if (!panel) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var sort = panel.querySelector("[data-filter-sort]");
    var grid = document.querySelector("[data-movie-grid]");
    var empty = document.querySelector("[data-empty-state]");
    if (!grid) {
      return;
    }
    var cards = selectAll(".movie-card", grid);

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var visible = [];
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-region")
        ].join(" ").toLowerCase();
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible.push(card);
        }
      });
      if (sort) {
        var mode = sort.value;
        visible.sort(function (a, b) {
          if (mode === "rating") {
            return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
          }
          if (mode === "year") {
            return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
          }
          return Number(b.getAttribute("data-views")) - Number(a.getAttribute("data-views"));
        });
        visible.forEach(function (card) {
          grid.appendChild(card);
        });
      }
      if (empty) {
        empty.classList.toggle("is-visible", visible.length === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    if (sort) {
      sort.addEventListener("change", apply);
    }
    apply();
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-views=\"" + movie.views + "\" data-rating=\"" + movie.rating + "\" data-genre=\"" + escapeHtml((movie.genres || []).join(" ")) + "\" data-region=\"" + escapeHtml(movie.region) + "\">" +
      "<a class=\"poster-wrap\" href=\"movies/" + movie.file + "\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-duration\">" + escapeHtml(movie.duration) + "</span>" +
      "<span class=\"poster-play\">▶</span>" +
      "</a>" +
      "<div class=\"movie-card-body\">" +
      "<div class=\"card-topline\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.rating) + "</span></div>" +
      "<h3><a href=\"movies/" + movie.file + "\">" + escapeHtml(movie.title) + "</a></h3>" +
      "<p>" + escapeHtml(movie.oneLine) + "</p>" +
      "<div class=\"tag-row\">" + tags + "</div>" +
      "</div>" +
      "</article>";
  }

  function initSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.MOVIE_INDEX) {
      return;
    }
    var input = root.querySelector("[data-search-input]");
    var region = root.querySelector("[data-search-region]");
    var genre = root.querySelector("[data-search-genre]");
    var sort = root.querySelector("[data-search-sort]");
    var results = root.querySelector("[data-search-results]");
    var empty = root.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    if (input) {
      input.value = initial;
    }

    function apply() {
      var keyword = input ? input.value.trim().toLowerCase() : "";
      var regionValue = region ? region.value : "";
      var genreValue = genre ? genre.value : "";
      var items = window.MOVIE_INDEX.filter(function (movie) {
        var haystack = [movie.title, movie.year, movie.region, movie.genreRaw, movie.oneLine, (movie.tags || []).join(" ")].join(" ").toLowerCase();
        var keywordMatched = !keyword || haystack.indexOf(keyword) !== -1;
        var regionMatched = !regionValue || movie.regionGroup === regionValue;
        var genreMatched = !genreValue || (movie.genres || []).indexOf(genreValue) !== -1;
        return keywordMatched && regionMatched && genreMatched;
      });
      var mode = sort ? sort.value : "views";
      items.sort(function (a, b) {
        if (mode === "rating") {
          return Number(b.rating) - Number(a.rating);
        }
        if (mode === "year") {
          return Number(b.year) - Number(a.year);
        }
        return Number(b.views) - Number(a.views);
      });
      results.innerHTML = items.slice(0, 120).map(movieCard).join("");
      if (empty) {
        empty.classList.toggle("is-visible", items.length === 0);
      }
    }

    [input, region, genre, sort].forEach(function (node) {
      if (node) {
        node.addEventListener(node.tagName === "INPUT" ? "input" : "change", apply);
      }
    });

    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initCategoryFilter();
    initSearchPage();
  });
})();
