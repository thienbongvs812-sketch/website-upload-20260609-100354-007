document.addEventListener("DOMContentLoaded", function () {
  var menuButton = document.querySelector(".menu-toggle");
  var mobilePanel = document.querySelector(".mobile-panel");

  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function () {
      var expanded = menuButton.getAttribute("aria-expanded") === "true";
      menuButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.from(hero.querySelectorAll(".hero-slide"));
    var dots = Array.from(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function run() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        run();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        run();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        run();
      });
    });

    show(0);
    run();
  }

  document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
    var input = panel.querySelector(".movie-search");
    var cards = Array.from(panel.querySelectorAll(".movie-card"));
    var empty = panel.querySelector(".filter-empty");
    var chips = Array.from(panel.querySelectorAll(".filter-chip"));
    var chipValue = "";

    function filterCards() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var visible = 0;

      cards.forEach(function (card) {
        var text = (card.getAttribute("data-title") || card.textContent || "").toLowerCase();
        var matchesText = !query || text.indexOf(query) !== -1;
        var matchesChip = !chipValue || text.indexOf(chipValue.toLowerCase()) !== -1;
        var showCard = matchesText && matchesChip;
        card.style.display = showCard ? "" : "none";
        if (showCard) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chipValue = chip.getAttribute("data-filter-value") || "";
        chips.forEach(function (item) {
          item.classList.toggle("is-active", item === chip);
        });
        filterCards();
      });
    });
  });
});
