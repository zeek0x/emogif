((win) => {
  'use strict'
  win.onload = async () => {
    // global
    const SlackEmojiKB = 128;
    const timeUnit = 0.1;
    const file = document.getElementById('file');
    const table = document.getElementById('table');
    const fps = document.getElementById('fps');
    const scale = document.getElementById('scale');
    const timer = document.getElementById('timer');
    const start = document.getElementById('start');
    const end = document.getElementById('end');
    const container = document.getElementById('container');
    const overlay = document.getElementById('overlay');
    const corner = document.getElementById('corner');
    const video = document.getElementById('video');
    const source = document.getElementById('source');
    const img = document.getElementById('img');

    // ============================================================
    // File -> Video -> Style
    // ============================================================

    const handleChange = (event) => {
      const file = event.target.files[0];
      source.src = window.URL.createObjectURL(file);
      video.load();
    }
    file.addEventListener('change', handleChange);

    const handleLoadeddataEvent = event => {
      fps.value = 10;
      fps.min = scale.min = 1;
      fps.max = 30; // TODO: set the video fps
      scale.max = 100; // [%]
      timer.value = start.value = 0;
      timer.min = start.min = end.min = 0;
      timer.max = start.max = end.max = parseInt(video.duration) / timeUnit;
      setElementW(table, video.clientWidth);
      setElementX(overlay, 0);
      setElementY(overlay, 0);
      setBottomRight(corner);
    }
    video.addEventListener('loadeddata', handleLoadeddataEvent, false);

    // ============================================================
    // Timer
    // ============================================================

    // Custom Property for 'Video is playing'.
    Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
      // Function notation to avoid binding 'this' at declaration time.
      get: function () {
        return this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2;
      }
    });

    const handleClickEvent = event => {
      video.playing ? video.pause() : video.play();
    }

    const handleTimeUpdateEvent = event => {
      timer.value = video.currentTime / timeUnit;
    }

    const handleInputEvent = ({target: {value}}) => {
      video.currentTime = parseInt(value) * timeUnit;
    }

    video.addEventListener('click', handleClickEvent, false);
    video.addEventListener('timeupdate', handleTimeUpdateEvent, false);
    timer.addEventListener('input', handleInputEvent, false);
    start.addEventListener('input', handleInputEvent, false);
    end.addEventListener('input', handleInputEvent, false);

    // ============================================================
    // Drag Move
    // ============================================================

    // Custom Property for 'Div is dragging'.
    Object.defineProperty(overlay, 'dragging', {
      writable: true,
      value: false
    });

    Object.defineProperty(corner, 'dragging', {
      writable: true,
      value: false
    });

    const handleOverlayMouseDonw = ({which, target}) => {
      if (which === 1) {
        target.dragging = true;
      }
    }

    const handleCornerMouseDown = ({which, target}) => {
      if (which === 1) {
        target.dragging = true;
      }
    }

    const handleMouseUp = ({which})  => {
      if (which === 1) {
        overlay.dragging = corner.dragging = false;
      }
    }

    const handleMoveEvent = ({movementX, movementY}) => {
      if (corner.dragging) {
        zoom(movementX);
        return;
      }

      if (overlay.dragging) {
        move(movementX, movementY);
      }
    }

    overlay.addEventListener('mousedown', handleOverlayMouseDonw, false);
    corner.addEventListener('mousedown', handleCornerMouseDown, false);
    document.addEventListener('mouseup', handleMouseUp, false);
    document.addEventListener('mousemove', handleMoveEvent, false);

    // Note: Adhoc utility for overlay & corner.
    // TODO: Fix adhoc...

    const move = (dx, dy) => {
      const p = getPosition(overlay);
      setElementX(overlay, p.x + dx);
      setElementY(overlay, p.y + dy);
      setBottomRight(corner);
    }

    const zoom = (dx) => {
      const s = getSize(overlay);
      setElementW(overlay, s.w + dx);
      setElementH(overlay, s.w + dx);
      setBottomRight(corner);
    }

    const setBottomRight = (child, parent = child.parentNode) => {
      const ps = getSize(parent);
      const cs = getSize(child);
      setElementX(child, ps.w - cs.w);
      setElementY(child, ps.h - cs.h);
    }

    const handleGenerateEmogif = async event => {
      const p = getPosition(overlay, container);
      const s = getSize(overlay);

      const ss = parseInt(start.value) * timeUnit + '';
      const duration = (parseInt(end.value) - parseInt(start.value)) * timeUnit + '';
      const x = p.x;
      const y = p.y;
      const w = s.w;
      const h = s.h;
      const _fps = parseInt(fps.value);
      const _scale = parseInt(getMaxVideoLength(video) * parseInt(scale.value) / 100);

      const blob =
        await emogifTranscode(
          {ss:ss, duration:duration, x:x, y:y, w:w, h:h, fps:_fps, scale:_scale}, file.files[0]
        );
      console.log(blob.size);
      img.src = URL.createObjectURL(blob);
    }

    const handleOverlayDbclick = async event => {
      if (video.readyState === 0) {
        return ;
      }

      await handleGenerateEmogif(event);
    }
    overlay.addEventListener('dblclick', handleOverlayDbclick);

    // ============================================================
    // Element Util
    // ============================================================

    const getMaxVideoLength = element => {
      const w = element.videoWidth;
      const h = element.videoHeight;
      return w > h ? w : h;
    }

    const getSize = element => {
      const rect = element.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      return {w, h};
    }

    // TODO: Fix getPosition adhoc part.

    const getPosition = (child, parent = child.parentNode) => {
      const rect1 = child.getBoundingClientRect();
      const rect2 = parent.getBoundingClientRect();
      const x = rect1.x - rect2.x;
      const y = rect1.y - rect2.y;
      return {x, y};
    }

    const setElementX = (e, x) => {
      e.style.left = x + 'px';
    }

    const setElementY = (e, y) => {
      e.style.top = y + 'px';
    }

    const setElementW = (e, w) => {
      e.style.width = w + 'px';
    }

    const setElementH = (e, h) => {
      e.style.height = h + 'px';
    }
  }
})(window);
