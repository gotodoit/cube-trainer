(function (global) {
  const MOVES = ["U", "U'", "U2", "D", "D'", "D2", "R", "R'", "R2", "L", "L'", "L2", "F", "F'", "F2", "B", "B'", "B2"];

  function randomScramble(len = 16) {
    const out = [];
    let lastFace = "";
    while (out.length < len) {
      const m = MOVES[Math.floor(Math.random() * MOVES.length)];
      const face = m[0];
      if (face === lastFace) continue;
      out.push(m);
      lastFace = face;
    }
    return out.join(" ");
  }

  global.Scramble = { randomScramble };
})(typeof window !== "undefined" ? window : globalThis);
