(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function initHeader() {
    var header = document.querySelector("[data-site-header]");
    var button = document.querySelector("[data-mobile-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    function syncHeader() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 16);
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (button && mobileNav) {
      button.addEventListener("click", function () {
        var open = mobileNav.classList.toggle("is-open");
        document.body.classList.toggle("is-menu-open", open);
      });
    }
  }

  function initHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initSearchSections() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("[data-search-section]"));
    sections.forEach(function (section) {
      var input = section.querySelector("[data-search-input]");
      var cards = Array.prototype.slice.call(section.querySelectorAll("[data-search-card]"));
      var chips = Array.prototype.slice.call(section.querySelectorAll("[data-filter]"));
      var empty = section.querySelector("[data-empty-state]");
      var activeFilter = "all";

      function apply() {
        var query = input ? input.value.trim().toLowerCase() : "";
        var shown = 0;
        cards.forEach(function (card) {
          var keywords = (card.getAttribute("data-keywords") || "").toLowerCase();
          var category = card.getAttribute("data-category") || "";
          var matchQuery = !query || keywords.indexOf(query) !== -1;
          var matchFilter = activeFilter === "all" || category === activeFilter;
          var visible = matchQuery && matchFilter;
          card.hidden = !visible;
          if (visible) {
            shown += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("is-visible", shown === 0);
        }
      }

      if (input) {
        input.addEventListener("input", apply);
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          activeFilter = chip.getAttribute("data-filter") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("is-active", item === chip);
          });
          apply();
        });
      });

      apply();
    });
  }

  function startPlayer(options) {
    ready(function () {
      var video = document.getElementById(options.videoId);
      var overlay = document.getElementById(options.overlayId);
      var src = options.src;
      var hls = null;
      var loaded = false;

      if (!video || !src) {
        return;
      }

      function playVideo() {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {});
        }
      }

      function load() {
        if (loaded) {
          playVideo();
          return;
        }
        loaded = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          playVideo();
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MEDIA_ATTACHED, function () {
            hls.loadSource(src);
          });
          hls.on(window.Hls.Events.MANIFEST_PARSED, playVideo);
        } else {
          video.src = src;
          video.addEventListener("loadedmetadata", playVideo, { once: true });
          playVideo();
        }
      }

      function begin() {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        load();
      }

      if (overlay) {
        overlay.addEventListener("click", begin);
      }

      video.addEventListener("click", function () {
        if (video.paused) {
          begin();
        }
      });

      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });

      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  window.SitePlayer = {
    start: startPlayer
  };

  ready(function () {
    initHeader();
    initHeroSlider();
    initSearchSections();
  });
})();
