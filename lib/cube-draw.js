/**
 * F2L 示意图：等轴测「立体」三面（U 顶 / F 前 / R 右），像拿着魔方右前角看。
 * Facelets 顺序 URFDLB × 9（与 cubejs 一致）。
 */
(function (global) {
  /** 等轴测投影：x 右、y 上、z 前 */
  function iso(x, y, z, ox, oy, s) {
    const px = ox + (x - z) * s * 0.866;
    const py = oy - y * s + (x + z) * s * 0.5;
    return [px, py];
  }

  function poly(pts) {
    return pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ") + " Z";
  }

  function quad(a, b, c, d) {
    return poly([a, b, c, d]);
  }

  /**
   * @param {string[]} facelets 54 colors
   * @param {Set<number>} highlight
   */
  function drawIso(facelets, opts = {}) {
    const highlight = opts.highlight || new Set();
    const hex = (global.CubeEngine && CubeEngine.COLOR_HEX) || {};
    const s = opts.size || 26;
    const ox = opts.ox || 150;
    const oy = opts.oy || 175;
    const w = opts.width || 300;
    const h = opts.height || 260;

    function sticker(faceIdx, i, corners, dim) {
      const idx = faceIdx * 9 + i;
      const color = hex[facelets[idx]] || "#333";
      const isHL = highlight.has(idx);
      const fill = dim && !isHL ? soften(color) : color;
      const stroke = isHL ? "#fbbf24" : "#0b0d12";
      const sw = isHL ? 2.4 : 1;
      return `<path d="${quad(...corners)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"/>`;
    }

    function soften(hexColor) {
      // slightly darken non-highlight stickers so pair pops
      return hexColor;
    }

    let out = "";

    // Draw order: U (back stickers first), then F, then R — painter's algorithm
    // U face: y=3; row0=back(z小) col0=left(x小)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const i = r * 3 + c;
        const x0 = c;
        const z0 = r;
        const p = [
          iso(x0, 3, z0, ox, oy, s),
          iso(x0 + 1, 3, z0, ox, oy, s),
          iso(x0 + 1, 3, z0 + 1, ox, oy, s),
          iso(x0, 3, z0 + 1, ox, oy, s),
        ];
        out += sticker(0, i, p, true);
      }
    }

    // F face: z=3; row0=top(y大) col0=left(x小)
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const i = r * 3 + c;
        const x0 = c;
        const y1 = 3 - r;
        const y0 = 2 - r;
        const p = [
          iso(x0, y1, 3, ox, oy, s),
          iso(x0 + 1, y1, 3, ox, oy, s),
          iso(x0 + 1, y0, 3, ox, oy, s),
          iso(x0, y0, 3, ox, oy, s),
        ];
        out += sticker(2, i, p, true);
      }
    }

    // R face: x=3; row0=top; col0=前(F,z大) → 看 R 时左边是 F
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const i = r * 3 + c;
        const z1 = 3 - c;
        const z0 = 2 - c;
        const y1 = 3 - r;
        const y0 = 2 - r;
        const p = [
          iso(3, y1, z1, ox, oy, s),
          iso(3, y1, z0, ox, oy, s),
          iso(3, y0, z0, ox, oy, s),
          iso(3, y0, z1, ox, oy, s),
        ];
        out += sticker(1, i, p, true);
      }
    }

    // Labels removed — cube alone is clearer on phone
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" style="max-width:320px;touch-action:manipulation">`;
    svg += `<rect width="${w}" height="${h}" fill="#12141c" rx="8"/>`;
    svg += out;
    svg += "</svg>";
    return svg;
  }

  /** 旧版展开图，保留备用 */
  function drawNet(facelets, opts = {}) {
    const highlight = opts.highlight || new Set();
    const hex = (global.CubeEngine && CubeEngine.COLOR_HEX) || {};
    const cell = opts.cell || 28;
    const gap = 2;
    const w = cell * 6 + gap * 4;
    const h = cell * 6 + gap * 4;

    function faceGrid(faceIdx, x0, y0) {
      let out = "";
      for (let i = 0; i < 9; i++) {
        const r = Math.floor(i / 3);
        const c = i % 3;
        const idx = faceIdx * 9 + i;
        const color = hex[facelets[idx]] || "#333";
        const x = x0 + c * (cell + gap);
        const y = y0 + r * (cell + gap);
        const isHL = highlight.has(idx);
        const stroke = isHL ? "#fbbf24" : "#0f1117";
        const sw = isHL ? 3 : 1;
        out += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${color}" stroke="${stroke}" stroke-width="${sw}"/>`;
      }
      return out;
    }

    const uX = cell * 1.5 + gap;
    const uY = gap;
    const fX = cell * 1.5 + gap;
    const fY = cell * 3 + gap * 3;
    const rX = cell * 4.5 + gap * 3;
    const rY = cell * 3 + gap * 3;

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" style="max-width:280px">`;
    svg += faceGrid(0, uX, uY);
    svg += faceGrid(2, fX, fY);
    svg += faceGrid(1, rX, rY);
    svg += `</svg>`;
    return svg;
  }

  function drawCase(setupAlg, opts = {}) {
    const facelets = CubeEngine.stateAfterSetup(setupAlg);
    const highlight = CubeEngine.highlightFR(facelets);
    const mode = opts.mode || "iso";
    if (mode === "net") return drawNet(facelets, { ...opts, highlight });
    return drawIso(facelets, { ...opts, highlight });
  }

  global.CubeDraw = { drawIso, drawNet, drawCase };
})(typeof window !== "undefined" ? window : globalThis);
