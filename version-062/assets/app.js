(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setupHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-menu-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function syncHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 12) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (toggle && mobileNav) {
      toggle.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var index = 0;

    if (!slides.length) {
      return;
    }

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
      });
    });

    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var input = document.querySelector("[data-search-input]");
    var yearFilter = document.querySelector("[data-year-filter]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));

    if (!cards.length || (!input && !yearFilter)) {
      return;
    }

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : "";
      var year = yearFilter ? yearFilter.value : "";

      cards.forEach(function (card) {
        var searchText = card.getAttribute("data-search") || "";
        var cardYear = card.getAttribute("data-year") || "";
        var matchesQuery = !query || searchText.indexOf(query) !== -1;
        var matchesYear = !year || cardYear === year;
        card.classList.toggle("is-hidden", !(matchesQuery && matchesYear));
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }
    if (yearFilter) {
      yearFilter.addEventListener("change", applyFilters);
    }
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
      var video = player.querySelector("video");
      var button = player.querySelector("[data-play-button]");
      var stream = player.getAttribute("data-stream");
      var hlsInstance = null;
      var attached = false;

      if (!video || !stream) {
        return;
      }

      function attachStream() {
        if (attached) {
          return;
        }
        attached = true;

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      }

      function playVideo() {
        attachStream();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {});
        }
        player.classList.add("is-playing");
      }

      if (button) {
        button.addEventListener("click", playVideo);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });

      video.addEventListener("play", function () {
        player.classList.add("is-playing");
      });

      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          player.classList.remove("is-playing");
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function () {
    setupHeader();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
