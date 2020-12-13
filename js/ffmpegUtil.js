(async (win) => {
  'use strict';

  if (!win.FFmpeg) {
    console.warn('FFmpeg is not loaded!!!');
    return;
  }

  const { createFFmpeg, fetchFile } = FFmpeg;
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  const emogifTranscode = async ({ss, duration, w, h, x, y, fps, scale}, file) => {
    const { name } = file;
    ffmpeg.FS('writeFile', name, await fetchFile(file));
    const filterComplex = `crop=${w}:${h}:${x}:${y},fps=${fps},yadif,scale=${scale}:-1`
    const output = '__output__.gif'

    const result =
      await ffmpeg.run(
        '-ss', ss,
        '-t', duration,
        '-i', name,
        '-filter_complex', filterComplex,
        output
      );
    console.log(result);
    const data = ffmpeg.FS('readFile', output);
    return new Blob([data.buffer], { type: 'video/mp4' });
  }

  win.emogifTranscode = emogifTranscode;
})(window);

