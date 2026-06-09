(function () {
  window.startMoviePlayer = function (options) {
    const video = document.getElementById(options.videoId);
    const overlay = document.getElementById(options.overlayId);
    const button = document.getElementById(options.buttonId);
    const streamUrl = options.streamUrl;
    let prepared = false;
    let hlsInstance = null;

    function prepare() {
      if (prepared || !video || !streamUrl) return;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
      prepared = true;
    }

    function play() {
      prepare();
      if (overlay) overlay.classList.add('is-hidden');
      if (video) {
        video.controls = true;
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
    }

    if (overlay) overlay.addEventListener('click', play);
    if (button) button.addEventListener('click', play);
    if (video) {
      video.addEventListener('play', function () {
        if (overlay) overlay.classList.add('is-hidden');
      });
      video.addEventListener('emptied', function () {
        if (hlsInstance && typeof hlsInstance.destroy === 'function') {
          hlsInstance.destroy();
          hlsInstance = null;
        }
        prepared = false;
      });
    }
  };
})();
