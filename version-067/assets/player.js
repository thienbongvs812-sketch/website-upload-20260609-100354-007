function initMoviePlayer(streamUrl) {
  var video = document.querySelector(".movie-video");
  var cover = document.querySelector(".player-cover");
  var button = document.querySelector(".play-button");
  var loaded = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (loaded) {
      return;
    }
    loaded = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
  }

  function startVideo() {
    attachStream();
    if (cover) {
      cover.classList.add("is-hidden");
    }
    video.setAttribute("controls", "controls");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        video.setAttribute("controls", "controls");
      });
    }
  }

  if (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      startVideo();
    });
  }

  if (cover) {
    cover.addEventListener("click", startVideo);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startVideo();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
      hlsInstance = null;
    }
  });
}
