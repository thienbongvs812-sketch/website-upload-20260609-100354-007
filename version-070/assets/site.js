(function () {
  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");

    if (!button || !nav) {
      return;
    }

    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
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

    function move(step) {
      show(current + step);
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        move(1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        move(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        move(1);
        start();
      });
    }

    if (slides.length > 1) {
      start();
    }
  }

  function initSearch() {
    var index = window.SEARCH_INDEX || [];
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-search-box]"));

    boxes.forEach(function (box) {
      var input = box.querySelector("[data-search-input]");
      var panel = box.querySelector("[data-search-panel]");

      if (!input || !panel) {
        return;
      }

      function close() {
        panel.classList.remove("is-open");
        panel.innerHTML = "";
      }

      function render(items) {
        if (!items.length) {
          panel.innerHTML = '<div class="search-empty">没有找到匹配影片</div>';
          panel.classList.add("is-open");
          return;
        }

        panel.innerHTML = items.map(function (item) {
          return '<a class="search-result" href="' + escapeHtml(item.url) + '">' +
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong>' +
            '<em>' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.category) + '</em></span>' +
            '</a>';
        }).join("");
        panel.classList.add("is-open");
      }

      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();

        if (!query) {
          close();
          return;
        }

        var matches = index.filter(function (item) {
          var haystack = [item.title, item.year, item.region, item.type, item.category, item.tags, item.oneLine].join(" ").toLowerCase();
          return haystack.indexOf(query) !== -1;
        }).slice(0, 10);

        render(matches);
      });

      document.addEventListener("click", function (event) {
        if (!box.contains(event.target)) {
          close();
        }
      });
    });
  }

  function initCategoryFilter() {
    var panels = Array.prototype.slice.call(document.querySelectorAll("[data-category-filter]"));

    panels.forEach(function (panel) {
      var textInput = panel.querySelector("[data-filter-text]");
      var yearSelect = panel.querySelector("[data-filter-year]");
      var regionSelect = panel.querySelector("[data-filter-region]");
      var list = panel.nextElementSibling;

      if (!list) {
        return;
      }

      var cards = Array.prototype.slice.call(list.querySelectorAll("[data-movie-card]"));

      function apply() {
        var keyword = textInput ? textInput.value.trim().toLowerCase() : "";
        var year = yearSelect ? yearSelect.value : "";
        var region = regionSelect ? regionSelect.value : "";

        cards.forEach(function (card) {
          var cardText = [card.dataset.title, card.dataset.year, card.dataset.region, card.dataset.tags].join(" ").toLowerCase();
          var matchedKeyword = !keyword || cardText.indexOf(keyword) !== -1;
          var matchedYear = !year || card.dataset.year === year;
          var matchedRegion = !region || card.dataset.region === region;
          card.hidden = !(matchedKeyword && matchedYear && matchedRegion);
        });
      }

      [textInput, yearSelect, regionSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initHero();
    initSearch();
    initCategoryFilter();
  });
})();
