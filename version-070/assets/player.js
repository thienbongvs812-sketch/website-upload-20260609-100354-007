import { H as Hls } from "./hls.js";

export function initPlayer(source) {
  var video = document.querySelector("[data-video-player]");
  var overlay = document.querySelector("[data-play-overlay]");
  var attached = false;
  var hls = null;

  if (!video || !source) {
    return;
  }

  function attachSource() {
    if (attached) {
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    attached = true;
  }

  function hideOverlay() {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  }

  function showOverlay() {
    if (overlay) {
      overlay.classList.remove("is-hidden");
    }
  }

  async function playVideo() {
    attachSource();
    video.controls = true;
    hideOverlay();

    try {
      await video.play();
    } catch (error) {
      showOverlay();
    }
  }

  if (overlay) {
    overlay.addEventListener("click", playVideo);
  }

  video.addEventListener("click", function () {
    if (!attached || video.paused) {
      playVideo();
    }
  });

  video.addEventListener("play", hideOverlay);
  video.addEventListener("ended", showOverlay);

  window.addEventListener("pagehide", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}
