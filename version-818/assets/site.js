(function() {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
    } else {
      document.addEventListener('DOMContentLoaded', callback);
    }
  }

  ready(function() {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function() {
        mobilePanel.classList.toggle('is-open');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === activeIndex);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === activeIndex);
      });
    }

    if (slides.length) {
      dots.forEach(function(dot, dotIndex) {
        dot.addEventListener('click', function() {
          showSlide(dotIndex);
          if (timer) {
            window.clearInterval(timer);
          }
          timer = window.setInterval(function() {
            showSlide(activeIndex + 1);
          }, 5200);
        });
      });
      timer = window.setInterval(function() {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    var filterPanels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

    filterPanels.forEach(function(panel) {
      var scope = document.querySelector(panel.getAttribute('data-filter-panel')) || document;
      var keywordInput = panel.querySelector('[data-keyword]');
      var yearSelect = panel.querySelector('[data-year]');
      var typeSelect = panel.querySelector('[data-type]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));

      function normalize(value) {
        return String(value || '').toLowerCase().trim();
      }

      function applyFilter() {
        var keyword = normalize(keywordInput && keywordInput.value);
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';

        cards.forEach(function(card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-type')
          ].join(' '));
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesYear = !year || card.getAttribute('data-year') === year;
          var matchesType = !type || card.getAttribute('data-type') === type;
          card.classList.toggle('hidden-card', !(matchesKeyword && matchesYear && matchesType));
        });
      }

      [keywordInput, yearSelect, typeSelect].forEach(function(control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });
    });
  });
})();
