(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupNavigation() {
    var toggle = document.querySelector(".nav-toggle");
    var nav = document.getElementById("siteNav");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.textContent = open ? "×" : "☰";
    });
  }

  function setupHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
    var dots = root.querySelector("[data-hero-dots]");
    if (!slides.length || !dots) {
      return;
    }
    var current = 0;
    var buttons = slides.map(function (_, index) {
      var button = document.createElement("button");
      button.type = "button";
      button.setAttribute("aria-label", "切换推荐影片 " + (index + 1));
      button.addEventListener("click", function () {
        show(index);
      });
      dots.appendChild(button);
      return button;
    });
    function show(index) {
      current = index;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("active", itemIndex === current);
      });
      buttons.forEach(function (button, itemIndex) {
        button.classList.toggle("active", itemIndex === current);
      });
    }
    show(0);
    window.setInterval(function () {
      show((current + 1) % slides.length);
    }, 5200);
  }

  function setupFilter() {
    var lists = Array.prototype.slice.call(document.querySelectorAll("[data-filter-list]"));
    if (!lists.length) {
      return;
    }
    var searchInput = document.querySelector("[data-search-input]");
    var yearSelect = document.querySelector("[data-filter-year]");
    var typeSelect = document.querySelector("[data-filter-type]");
    var emptyState = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q");
    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }
    function apply() {
      var query = text(searchInput ? searchInput.value : "");
      var year = text(yearSelect ? yearSelect.value : "");
      var type = text(typeSelect ? typeSelect.value : "");
      var visible = 0;
      lists.forEach(function (list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
        cards.forEach(function (card) {
          var haystack = text([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.textContent
          ].join(" "));
          var matchQuery = !query || haystack.indexOf(query) !== -1;
          var matchYear = !year || text(card.dataset.year) === year;
          var matchType = !type || text(card.dataset.type) === type;
          var keep = matchQuery && matchYear && matchType;
          card.hidden = !keep;
          if (keep) {
            visible += 1;
          }
        });
      });
      if (emptyState) {
        emptyState.hidden = visible !== 0;
      }
    }
    [searchInput, yearSelect, typeSelect].forEach(function (element) {
      if (element) {
        element.addEventListener("input", apply);
        element.addEventListener("change", apply);
      }
    });
    apply();
  }

  function setupSiteSearchForms() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-site-search]"));
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilter();
    setupSiteSearchForms();
  });
})();
