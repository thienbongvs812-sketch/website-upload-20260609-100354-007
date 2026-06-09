(function () {
  var headerButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (headerButton && mobileNav) {
    headerButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('open');
      headerButton.setAttribute('aria-expanded', String(isOpen));
    });
  }

  document.querySelectorAll('img').forEach(function (image) {
    image.addEventListener('error', function () {
      image.classList.add('image-hidden');
    }, { once: true });
  });

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

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

    function startSlider() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startSlider();
      });
    });

    showSlide(0);
    startSlider();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title][data-keywords]'));
  var activeCategory = 'all';

  function applyFilter() {
    var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';

    cards.forEach(function (card) {
      var text = [card.dataset.title, card.dataset.keywords].join(' ').toLowerCase();
      var categoryMatch = activeCategory === 'all' || card.dataset.category === activeCategory;
      var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
      card.classList.toggle('hidden-card', !(categoryMatch && keywordMatch));
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeCategory = button.getAttribute('data-filter') || 'all';

      filterButtons.forEach(function (item) {
        item.classList.toggle('active', item === button);
      });

      applyFilter();
    });
  });

  function initPlayer() {
    var video = document.querySelector('[data-movie-player]');
    var overlay = document.querySelector('[data-player-overlay]');
    var startButton = document.querySelector('[data-player-start]');

    if (!video) {
      return;
    }

    var source = video.getAttribute('data-source');
    var hlsReady = false;

    function prepareVideo() {
      if (!source || hlsReady) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        hlsReady = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });

        hls.loadSource(source);
        hls.attachMedia(video);
        hlsReady = true;
      }
    }

    function playVideo() {
      prepareVideo();

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    }

    if (startButton) {
      startButton.addEventListener('click', playVideo);
    }

    video.addEventListener('click', playVideo);
    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    prepareVideo();
  }

  initPlayer();
})();
