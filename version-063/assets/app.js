(function () {
    var header = document.querySelector('[data-header]');
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function updateHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 18) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });

    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
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

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                start();
            });
        });

        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    });

    document.querySelectorAll('[data-catalog]').forEach(function (panel) {
        var section = panel.closest('.catalog-section') || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll('[data-card]'));
        var input = panel.querySelector('[data-card-search]');
        var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter]'));
        var empty = panel.querySelector('[data-empty-state]');
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');

        function fillSelect(select) {
            if (select.options.length > 1) {
                return;
            }
            var key = select.getAttribute('data-filter');
            var values = [];
            var seen = {};
            cards.forEach(function (card) {
                var value = card.getAttribute('data-' + key) || '';
                if (value && !seen[value]) {
                    seen[value] = true;
                    values.push(value);
                }
            });
            values.sort(function (a, b) {
                if (/^\d+$/.test(a) && /^\d+$/.test(b)) {
                    return Number(b) - Number(a);
                }
                return a.localeCompare(b, 'zh-CN');
            });
            values.forEach(function (value) {
                var option = document.createElement('option');
                option.value = value;
                if (key === 'category') {
                    var matched = cards.find(function (card) {
                        return card.getAttribute('data-category') === value;
                    });
                    option.textContent = matched ? matched.querySelector('.tag-row span').textContent || value : value;
                } else {
                    option.textContent = value;
                }
                select.appendChild(option);
            });
        }

        selects.forEach(fillSelect);

        if (query && input) {
            input.value = query;
        }

        function applyFilter() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var visible = 0;
            cards.forEach(function (card) {
                var matched = true;
                if (keyword) {
                    var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
                    matched = haystack.indexOf(keyword) !== -1;
                }
                selects.forEach(function (select) {
                    var key = select.getAttribute('data-filter');
                    var value = select.value;
                    if (value && card.getAttribute('data-' + key) !== value) {
                        matched = false;
                    }
                });
                card.classList.toggle('is-hidden', !matched);
                if (matched) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', applyFilter);
        });
        applyFilter();
    });

    function loadHlsLibrary(callback) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
        script.async = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        document.head.appendChild(script);
    }

    document.querySelectorAll('[data-player]').forEach(function (player) {
        var video = player.querySelector('[data-video]');
        var button = player.querySelector('[data-play-button]');
        var source = player.getAttribute('data-video-url');
        var hlsInstance = null;
        var binding = false;
        var sourceReady = false;
        var callbacks = [];

        function flushCallbacks() {
            sourceReady = true;
            binding = false;
            while (callbacks.length) {
                var next = callbacks.shift();
                next();
            }
        }

        function bindSource(callback) {
            if (!video || !source) {
                return;
            }
            if (sourceReady) {
                callback();
                return;
            }
            callbacks.push(callback);
            if (binding) {
                return;
            }
            binding = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                flushCallbacks();
                return;
            }
            loadHlsLibrary(function () {
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, flushCallbacks);
                    hlsInstance.on(window.Hls.Events.ERROR, function () {
                        if (!video.src) {
                            video.src = source;
                            flushCallbacks();
                        }
                    });
                } else {
                    video.src = source;
                    flushCallbacks();
                }
            });
        }

        function playVideo() {
            bindSource(function () {
                var request = video.play();
                player.classList.add('is-playing');
                if (request && typeof request.catch === 'function') {
                    request.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            });
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.stopPropagation();
                playVideo();
            });
        }
        player.addEventListener('click', function (event) {
            if (event.target === video) {
                return;
            }
            if (!player.classList.contains('is-playing')) {
                playVideo();
            }
        });
        if (video) {
            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                if (video.currentTime === 0 || video.ended) {
                    player.classList.remove('is-playing');
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
