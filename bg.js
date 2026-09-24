(() => {
  const cv = document.getElementById('bg'), ctx = cv.getContext('2d');
  const CELL = 4, N = 256;
  const grid = new Float32Array(N * N).map(() => Math.random());
  const bayer = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v => v / 16 - .5);
  // rose theme: near-black plum, deep wine, magenta, hot pink, light blush
  const pal = [[23,3,14],[80,8,44],[160,24,96],[240,70,150],[255,196,222]];
  const smooth = t => t * t * (3 - 2 * t);
  const at = (x, y) => grid[((y & 255) << 8) | (x & 255)];
  function noise(x, y) {
    const xi = Math.floor(x), yi = Math.floor(y), u = smooth(x - xi), v = smooth(y - yi);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  const fbm = (x, y) => noise(x, y) * .55 + noise(x * 2.1 + 7, y * 2.1 + 3) * .3 + noise(x * 4.3 + 1, y * 4.3 + 9) * .15;
  let w, h, img, mx = -1, my = -1, last = 0;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize() {
    w = Math.ceil(innerWidth / CELL); h = Math.ceil(innerHeight / CELL);
    cv.width = w; cv.height = h; img = ctx.createImageData(w, h);
    draw(performance.now());
  }
  function draw(now) {
    const t = now * (reduce ? 0.00002 : 0.00016), d = img.data, s = 0.026;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const wx = fbm(x * s + t * 5, y * s - t * 4) * 2.2, wy = fbm(x * s - t * 3 + 9, y * s + t * 6 + 4) * 2.2;
      let n = fbm(x * s + wx + t * 8, y * s * 1.1 + wy - t * 5);
      n = (n - .28) * 1.9;
      if (mx >= 0) { const dx = x - mx, dy = y - my; n += .35 * Math.exp(-(dx * dx + dy * dy) / 420); }
      n += bayer[((y & 3) << 2) | (x & 3)] * .32;
      const k = n < .28 ? 0 : n < .5 ? 1 : n < .68 ? 2 : n < .86 ? 3 : 4;
      const c = pal[k], i = (y * w + x) * 4;
      d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }
  function loop(now) { if (now - last > 33) { last = now; draw(now); } requestAnimationFrame(loop); }
  addEventListener('resize', resize);
  addEventListener('pointermove', e => { mx = e.clientX / CELL; my = e.clientY / CELL; });
  resize(); requestAnimationFrame(loop);
})();