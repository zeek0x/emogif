(($) => {
  'use strict'
  $.onload = async () => {
    // global
    const SlackEmojiKB = 128
    const timeUnit = 0.1
    const $file = document.getElementById('file')
    const $table = document.getElementById('table')
    const $fps = document.getElementById('fps')
    const $scale = document.getElementById('scale')
    const $timer = document.getElementById('timer')
    const $start = document.getElementById('start')
    const $end = document.getElementById('end')
    const $container = document.getElementById('container')
    const $overlay = document.getElementById('overlay')
    const $corner = document.getElementById('corner')
    const $video = document.getElementById('video')
    const $source = document.getElementById('source')
    const $imgAnchor = document.getElementById('img-anchor')
    const $img = document.getElementById('img')
    const $imgSize = document.getElementById('img-size')

    // ============================================================
    // File Change -> Video Load -> Style Format
    // ============================================================

    const handleChange = (event) => {
      const file = event.target.files[0]
      $source.src = URL.createObjectURL(file)
      $video.load()
    }
    $file.addEventListener('change', handleChange)

    const handleLoadeddataEvent = event => {
      $fps.max = 30 // TODO: set the video fps
      $fps.min = scale.min = 1
      $fps.value = 10
      $scale.max = 100 // [%]
      $scale.min = 0
      $scale.value = 31
      $timer.max = $start.max = $end.max = parseInt($video.duration) / timeUnit
      $timer.min = $start.min = $end.min = 0
      $timer.value = $start.value = 0
      setElementW($table, $video.clientWidth)
      setElementX($overlay, 0)
      setElementY($overlay, 0)
      setBottomRight($corner, $overlay)
    }
    $video.addEventListener('loadeddata', handleLoadeddataEvent, false)

    // ============================================================
    // Timer
    // ============================================================

    // Custom Property for 'Video is playing'.
    Object.defineProperty(HTMLMediaElement.prototype, 'playing', {
      // Function notation to avoid binding 'this' at declaration time.
      get: function () {
        return this.currentTime > 0 && !this.paused && !this.ended && this.readyState > 2
      }
    })

    const handleClickEvent = ({target}) => {
      target.playing ? target.pause() : target.play()
    }

    const handleTimeUpdateEvent = event => {
      $timer.value = $video.currentTime / timeUnit
    }

    const handleInputEvent = ({target: {value}}) => {
      $video.currentTime = parseInt(value) * timeUnit
    }

    $video.addEventListener('click', handleClickEvent, false)
    $video.addEventListener('timeupdate', handleTimeUpdateEvent, false)
    $timer.addEventListener('input', handleInputEvent, false)
    $start.addEventListener('input', handleInputEvent, false)
    $end.addEventListener('input', handleInputEvent, false)

    // ============================================================
    // Drag Move
    // ============================================================

    // Custom Property for 'Div is dragging'.
    const definePropertyDragging = object => {
      Object.defineProperty(object, 'dragging', {
        writable: true,
        value: false
      })
    }
    [$overlay, $corner].forEach(definePropertyDragging)

    const handleOverlayMouseDonw = ({which, target}) => {
      if (which === 1) {
        target.dragging = true
      }
    }

    const handleCornerMouseDown = ({which, target}) => {
      if (which === 1) {
        target.dragging = true
      }
    }

    const handleMouseUp = ({which})  => {
      if (which === 1) {
        $overlay.dragging = $corner.dragging = false
      }
    }

    const handleMoveEvent = ({movementX, movementY}) => {
      if ($corner.dragging) {
        zoom(movementX)
        return
      }

      if ($overlay.dragging) {
        move(movementX, movementY)
      }
    }

    $overlay.addEventListener('mousedown', handleOverlayMouseDonw, false)
    $corner.addEventListener('mousedown', handleCornerMouseDown, false)
    document.addEventListener('mouseup', handleMouseUp, false)
    document.addEventListener('mousemove', handleMoveEvent, false)

    // TODO: Fix adhoc...

    const move = (dx, dy) => {
      const {x, y} = getRelativePosition($overlay, $container)
      setElementX($overlay, x + dx)
      setElementY($overlay, y + dy)
      setBottomRight($corner, $overlay)
    }

    // TODO: Fix adhoc...

    const zoom = (dx) => {
      const { w } = getSize(overlay)
      const sideLength = w + dx
      setElementW($overlay, sideLength)
      setElementH($overlay, sideLength)
      setBottomRight($corner, $overlay)
    }

    const setBottomRight = (child, parent) => {
      const {w:pw, h:ph} = getSize(parent)
      const {w:cw, h:ch} = getSize(child)
      setElementX(child, pw - cw)
      setElementY(child, ph - ch)
    }

    const handleGenerateEmogif = async event => {
      const ss = parseInt($start.value) * timeUnit + ''
      const duration = (parseInt($end.value) - parseInt($start.value)) * timeUnit + ''
      const {x, y} = getRelativePosition($overlay, $container)
      const {w, h} = getSize($overlay)
      const fps = parseInt($fps.value)
      const scale = parseInt(getMaxVideoLength($video) * parseInt($scale.value) / 100)
      const file = $file.files[0]

      const blob =
        await emogifTranscode(
          {ss, duration, x, y, w, h, fps, scale}, file
        )

      $imgAnchor.href = $img.src = URL.createObjectURL(blob)
      $imgSize.textContent = blob.size / 1024 + ' [KB]'
    }

    const handleOverlayDbclick = async event => {
      if ($video.readyState === 0) {
        return
      }

      await handleGenerateEmogif(event)
    }
    $overlay.addEventListener('dblclick', handleOverlayDbclick)

    // ============================================================
    // Element Util
    // ============================================================

    const getMaxVideoLength = ({videoWidth:w, videoHeight:h}) => {
      return w > h ? w : h
    }

    const getSize = element => {
      const {width:w, height:h} = element.getBoundingClientRect()
      return {w, h}
    }

    const getRelativePosition = (rect1, rect2) => {
      const {x:x1, y:y1} = rect1.getBoundingClientRect()
      const {x:x2, y:y2} = rect2.getBoundingClientRect()
      const x = x1 - x2
      const y = y1 - y2
      return {x, y}
    }

    const setElementX = (e, x) => {
      e.style.left = x + 'px'
    }

    const setElementY = (e, y) => {
      e.style.top = y + 'px'
    }

    const setElementW = (e, w) => {
      e.style.width = w + 'px'
    }

    const setElementH = (e, h) => {
      e.style.height = h + 'px'
    }
  }
})(window)
