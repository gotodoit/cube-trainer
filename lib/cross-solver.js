/**
 * White-bottom cross solver (fixed orientation: yellow U, green F).
 * BFS on the 4 white edges; shortest face-turn solution, typically 4–8 moves.
 */
(function (global) {
  const MOVES = [
    "U", "U'", "U2", "D", "D'", "D2",
    "R", "R'", "R2", "L", "L'", "L2",
    "F", "F'", "F2", "B", "B'", "B2",
  ];

  // cubejs asString() URFDLB: DF/DR/DL/DB stickers (D color + side color)
  function crossKey(cube) {
    const s = cube.asString();
    return s[28] + s[25] + s[32] + s[16] + s[30] + s[43] + s[34] + s[52];
  }

  const SOLVED_KEY = "DFDRDLDB";

  function solveWhiteCross(scramble) {
    if (typeof Cube === "undefined") {
      return { ok: false, error: "Cubejs 未加载" };
    }
    const start = new Cube();
    const scr = String(scramble || "").trim();
    if (scr) start.move(scr);

    if (crossKey(start) === SOLVED_KEY) {
      return { ok: true, moves: [], alg: "（已是十字）", length: 0 };
    }

    const seen = new Set([crossKey(start)]);
    const queue = [{ cube: start, lastFace: "", path: [] }];

    for (let qi = 0; qi < queue.length; qi++) {
      const cur = queue[qi];
      if (cur.path.length >= 8) continue;

      for (let i = 0; i < MOVES.length; i++) {
        const m = MOVES[i];
        const face = m[0];
        if (face === cur.lastFace) continue;

        const next = cur.cube.clone();
        next.move(m);
        const key = crossKey(next);
        if (seen.has(key)) continue;
        seen.add(key);

        const path = cur.path.concat(m);
        if (key === SOLVED_KEY) {
          return { ok: true, moves: path, alg: path.join(" "), length: path.length };
        }
        queue.push({ cube: next, lastFace: face, path: path });
      }
    }

    return { ok: false, error: "未找到 8 步内的十字" };
  }

  global.CrossSolver = { solveWhiteCross, crossKey, SOLVED_KEY };
})(typeof window !== "undefined" ? window : globalThis);
