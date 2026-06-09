(function () {
    var header = document.querySelector('[data-header]');
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    if (header) {
        window.addEventListener('scroll', function () {
            header.classList.toggle('is-scrolled', window.scrollY > 20);
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        };

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        setInterval(function () {
            showSlide(current + 1);
        }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid]'));
    var queryParams = new URLSearchParams(window.location.search);
    var initialQuery = queryParams.get('q') || '';

    var runFilter = function (value) {
        var keyword = String(value || '').trim().toLowerCase();

        grids.forEach(function (grid) {
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-search]'));

            cards.forEach(function (card) {
                var text = String(card.getAttribute('data-search') || '').toLowerCase();
                card.style.display = !keyword || text.indexOf(keyword) !== -1 ? '' : 'none';
            });
        });
    };

    filterInputs.forEach(function (input) {
        if (initialQuery && !input.value) {
            input.value = initialQuery;
        }

        input.addEventListener('input', function () {
            runFilter(input.value);
        });
    });

    if (initialQuery) {
        runFilter(initialQuery);
    }
}());

function initMoviePlayer(config) {
    var video = document.getElementById('movie-video');
    var overlay = document.querySelector('.player-overlay');
    var prepared = false;
    var hlsInstance = null;

    if (!video || !config || !config.src) {
        return;
    }

    var prepare = function () {
        if (prepared) {
            return;
        }

        prepared = true;

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = config.src;
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(config.src);
            hlsInstance.attachMedia(video);
            return;
        }

        video.src = config.src;
    };

    var start = function () {
        prepare();

        if (overlay) {
            overlay.classList.add('is-hidden');
        }

        var playTask = video.play();

        if (playTask && typeof playTask.catch === 'function') {
            playTask.catch(function () {});
        }
    };

    if (overlay) {
        overlay.addEventListener('click', start);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
