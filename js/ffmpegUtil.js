(async (win) => {
  'use strict';

  if (!win.FFmpeg) {
    console.warn('FFmpeg is not loaded!!!');
    return;
  }

  const { createFFmpeg, fetchFile } = FFmpeg;
  // TODO: Set logger & Utilize logger output as system info.
  const ffmpeg = createFFmpeg({ log: true });
  await ffmpeg.load();

  const emogifTranscode = async ({ss, duration, w, h, x, y, fps, scale}, file) => {
    const { name } = file;

    // ffmpeg.wasm can't handle multi bytes character.
    const input = '__input__.' + name.split('.').pop();
    const output = '__output__.gif'
    const filterComplex = `crop=${w}:${h}:${x}:${y},fps=${fps},yadif,scale=${scale}:-1`

    console.log('Args:', ss, duration, input, filterComplex, output);
    ffmpeg.FS('writeFile', input, await fetchFile(file));
    await ffmpeg.run(
      '-ss', ss,
      '-t', duration,
      '-i', input,
      '-filter_complex', filterComplex,
      output
    );
    const data = ffmpeg.FS('readFile', output);
    return new Blob([data.buffer], { type: 'video/mp4' });
  }

  win.emogifTranscode = emogifTranscode;
})(window);
