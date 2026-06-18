
(function () {
  var body = document.body;
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');

  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
      body.classList.toggle('menu-open');
    });
  }

  var carousel = document.querySelector('[data-hero-carousel]');

  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot') || 0));
      });
    });

    window.setInterval(function () {
      showSlide(current + 1);
    }, 6200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var sortSelect = document.querySelector('[data-sort-select]');
  var categoryFilter = document.querySelector('[data-category-filter]');
  var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));

  function cardText(card) {
    return [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-genre') || '',
      card.getAttribute('data-category') || '',
      card.getAttribute('data-year') || '',
      card.textContent || ''
    ].join(' ').toLowerCase();
  }

  function filterCards() {
    var term = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var category = categoryFilter ? categoryFilter.value.trim() : '';

    lists.forEach(function (list) {
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

      cards.forEach(function (card) {
        var matchesText = !term || cardText(card).indexOf(term) !== -1;
        var matchesCategory = !category || cardText(card).indexOf(category.toLowerCase()) !== -1;
        card.classList.toggle('is-hidden', !(matchesText && matchesCategory));
      });
    });
  }

  function sortCards() {
    if (!sortSelect) {
      return;
    }

    var value = sortSelect.value;

    lists.forEach(function (list) {
      var cards = Array.prototype.slice.call(list.querySelectorAll('[data-card]'));

      cards.sort(function (a, b) {
        if (value === 'rating') {
          return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
        }
        if (value === 'year') {
          return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
        }
        if (value === 'title') {
          return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-CN');
        }
        return Number(b.getAttribute('data-views') || 0) - Number(a.getAttribute('data-views') || 0);
      });

      cards.forEach(function (card) {
        list.appendChild(card);
      });
    });

    filterCards();
  }

  if (filterInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q');

    if (q) {
      filterInput.value = q;
    }

    filterInput.addEventListener('input', filterCards);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', filterCards);
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', sortCards);
    sortCards();
  } else {
    filterCards();
  }
})();
