(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    ready(function () {
        var header = document.querySelector(".site-header");
        var toggle = document.querySelector(".mobile-toggle");
        var panel = document.querySelector(".mobile-panel");

        function updateHeader() {
            if (!header) {
                return;
            }
            if (window.scrollY > 20) {
                header.classList.add("is-scrolled");
            } else {
                header.classList.remove("is-scrolled");
            }
        }

        updateHeader();
        window.addEventListener("scroll", updateHeader, { passive: true });

        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                var isOpen = panel.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
            });
        }

        setupHeroCarousel();
        setupSiteSearch();
        setupCategoryFilters();
        setupPlayers();
    });

    function setupHeroCarousel() {
        var carousel = document.querySelector(".hero-carousel");
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
        var previous = carousel.querySelector(".hero-prev");
        var next = carousel.querySelector(".hero-next");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
            });
        }

        function schedule() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                schedule();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                schedule();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                schedule();
            });
        }

        schedule();
    }

    function setupSiteSearch() {
        var index = Array.isArray(window.MOVIE_SEARCH_INDEX) ? window.MOVIE_SEARCH_INDEX : [];
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".site-search-input"));

        inputs.forEach(function (input) {
            var box = input.parentElement ? input.parentElement.querySelector(".site-search-results") : null;
            if (!box) {
                return;
            }

            input.addEventListener("input", function () {
                var keyword = normalize(input.value);
                if (keyword.length < 1) {
                    box.classList.remove("is-visible");
                    box.innerHTML = "";
                    return;
                }

                var matches = index.filter(function (item) {
                    var haystack = normalize([
                        item.title,
                        item.year,
                        item.region,
                        item.type,
                        item.genre,
                        item.category,
                        item.tags
                    ].join(" "));
                    return haystack.indexOf(keyword) !== -1;
                }).slice(0, 14);

                if (!matches.length) {
                    box.innerHTML = '<div class="search-empty">暂无匹配影片</div>';
                    box.classList.add("is-visible");
                    return;
                }

                box.innerHTML = matches.map(function (item) {
                    return [
                        '<a class="search-result-item" href="' + item.url + '">',
                        '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '">',
                        '<span><strong>' + escapeHtml(item.title) + '</strong>',
                        '<span>' + escapeHtml(item.year + ' · ' + item.region + ' · ' + item.category) + '</span></span>',
                        '</a>'
                    ].join("");
                }).join("");
                box.classList.add("is-visible");
            });

            document.addEventListener("click", function (event) {
                if (!input.parentElement || !input.parentElement.contains(event.target)) {
                    box.classList.remove("is-visible");
                }
            });
        });
    }

    function setupCategoryFilters() {
        var panel = document.querySelector(".filter-panel");
        if (!panel) {
            return;
        }

        var input = panel.querySelector(".movie-filter");
        var chips = Array.prototype.slice.call(panel.querySelectorAll(".filter-chip"));
        var cards = Array.prototype.slice.call(document.querySelectorAll(".category-movie-grid .movie-card"));
        var activeType = "全部";

        function applyFilters() {
            var keyword = normalize(input ? input.value : "");
            cards.forEach(function (card) {
                var text = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-type")
                ].join(" "));
                var typeText = card.getAttribute("data-type") || "";
                var matchesKeyword = keyword === "" || text.indexOf(keyword) !== -1;
                var matchesType = activeType === "全部" || typeText.indexOf(activeType) !== -1;
                card.style.display = matchesKeyword && matchesType ? "" : "none";
            });
        }

        if (input) {
            input.addEventListener("input", applyFilters);
        }

        chips.forEach(function (chip) {
            chip.addEventListener("click", function () {
                activeType = chip.getAttribute("data-filter") || "全部";
                chips.forEach(function (item) {
                    item.classList.toggle("is-active", item === chip);
                });
                applyFilters();
            });
        });
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll(".movie-player"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var stream = player.getAttribute("data-stream");

            if (!video || !stream) {
                return;
            }

            function loadVideo() {
                if (video.dataset.ready === "1") {
                    return;
                }

                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    var hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                    video._hlsInstance = hls;
                } else {
                    video.src = stream;
                }

                video.dataset.ready = "1";
            }

            function playVideo() {
                loadVideo();
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener("click", playVideo);
            }

            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });

            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
})();
