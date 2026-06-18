(function () {
  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    var search = document.querySelector(".nav-search");

    if (!toggle || !menu) {
      return;
    }

    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      if (search) {
        search.classList.toggle("is-open");
      }
    });
  }

  function setupHero() {
    var carousel = document.querySelector("[data-hero-carousel]");

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var current = 0;

    function showSlide(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        showSlide(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  function setupCatalogSearch() {
    var input = document.querySelector("[data-catalog-search]");
    var list = document.querySelector("[data-catalog-list]");

    if (!input || !list) {
      return;
    }

    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

    input.addEventListener("input", function () {
      var keyword = input.value.trim().toLowerCase();
      cards.forEach(function (card) {
        var text = [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-year")
        ].join(" ").toLowerCase();
        card.style.display = text.indexOf(keyword) > -1 ? "" : "none";
      });
    });
  }

  function createSearchCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card";

    article.innerHTML = [
      '<a class="poster-link" href="' + movie.url + '" aria-label="' + escapeHtml(movie.title) + '">',
      '<img src="' + movie.image + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async" />',
      '<span class="poster-badge">' + escapeHtml(movie.type || "剧集") + "</span>",
      "</a>",
      '<div class="card-body">',
      '<div class="card-meta"><span>' + escapeHtml(movie.year || "热播") + "</span><span>" + escapeHtml(movie.region || "精选") + "</span></div>",
      '<h2><a href="' + movie.url + '">' + escapeHtml(movie.title) + "</a></h2>",
      "<p>" + escapeHtml(movie.oneLine || movie.summary || movie.title) + "</p>",
      '<div class="tag-list">' + createTags(movie.tags || movie.genre || "") + "</div>",
      "</div>"
    ].join("");

    return article;
  }

  function createTags(value) {
    return String(value || "")
      .split(/[,，/、|]+/)
      .filter(Boolean)
      .slice(0, 3)
      .map(function (tag) {
        return "<span>" + escapeHtml(tag.trim()) + "</span>";
      })
      .join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function setupSearchPage() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var status = document.querySelector("[data-search-status]");
    var movies = window.SiteMovieIndex || [];

    if (!form || !input || !results || !status) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialKeyword = params.get("q") || "";
    input.value = initialKeyword;

    function render(keyword) {
      var normalized = keyword.trim().toLowerCase();
      results.innerHTML = "";

      if (!normalized) {
        status.textContent = "输入关键词后显示相关影片。";
        return;
      }

      var matched = movies.filter(function (movie) {
        var text = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.tags,
          movie.category,
          movie.oneLine
        ].join(" ").toLowerCase();
        return text.indexOf(normalized) > -1;
      }).slice(0, 120);

      if (!matched.length) {
        status.textContent = "没有找到匹配影片。";
        return;
      }

      status.textContent = "相关影片如下。";
      matched.forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var keyword = input.value.trim();
      var nextUrl = keyword ? "search.html?q=" + encodeURIComponent(keyword) : "search.html";
      window.history.replaceState(null, "", nextUrl);
      render(keyword);
    });

    render(initialKeyword);
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNavigation();
    setupHero();
    setupCatalogSearch();
    setupSearchPage();
  });
})();
