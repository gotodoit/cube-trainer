/**
 * Thin wrapper around vendored cubejs for algs + facelet colors.
 * Facelet string order: URFDLB (9 each). Letters U/R/F/D/L/B map to sticker colors.
 */
(function (global) {
  const FACE_TO_COLOR = { U: "Y", R: "O", F: "G", D: "W", L: "R", B: "B" };
  const COLOR_HEX = {
    Y: "#f5d547",
    W: "#ececec",
    G: "#22c55e",
    B: "#3b82f6",
    O: "#f97316",
    R: "#ef4444",
  };

  function expandRepeats(alg) {
    let s = String(alg || "")
      .replace(/[’']/g, "'")
      .replace(/2'/g, "2");
    const re = /\(([^()]+)\)(\d+)/;
    while (re.test(s)) {
      s = s.replace(re, (_, inner, n) => Array(parseInt(n, 10)).fill(inner.trim()).join(" "));
    }
    return s.replace(/\s+/g, " ").trim();
  }

  function invertToken(tok) {
    tok = tok.replace(/[’']/g, "'").replace(/2'/g, "2");
    if (tok.endsWith("2")) return tok;
    if (tok.endsWith("'")) return tok.slice(0, -1);
    return tok + "'";
  }

  function invertAlg(alg) {
    const toks = expandRepeats(alg).split(" ").filter(Boolean);
    return toks.reverse().map(invertToken).join(" ");
  }

  function applyAlg(alg) {
    if (typeof Cube === "undefined") throw new Error("Cubejs not loaded");
    const c = new Cube();
    const expanded = expandRepeats(alg);
    if (expanded) c.move(expanded);
    return c;
  }

  /** 54 colors Y/W/G/B/O/R in URFDLB order */
  function faceletsFromAlg(alg) {
    const str = applyAlg(alg).asString();
    return str.split("").map((ch) => FACE_TO_COLOR[ch]);
  }

  function solvedFacelets() {
    return faceletsFromAlg("");
  }

  function highlightFR(facelets) {
    // Rebuild cubie colors via face letters on facelets — map back
    const set = new Set();
    // Convert colors back to face letters for matching WGO / GO
    const toFace = { Y: "U", O: "R", G: "F", W: "D", R: "L", B: "B" };
    const faces = facelets.map((c) => toFace[c]);
    // cornerFacelet / edgeFacelet from cubejs (1-based helpers converted):
    const corners = [
      [8, 9, 20], // URF U9 R1 F3 -> 0-based 8,9,20
      [6, 18, 38], // UFL
      [0, 36, 47], // ULB
      [2, 45, 11], // UBR
      [27, 26, 15], // DFR — D3 F9 R7 = 27+2=29? Wait D1-based
      // Use cubejs 1-based: _U(9)=8, _R(1)=9, _F(3)=20 for URF
      // DFR: _D(3)=29? _D(x)=27+(x-1), _D(3)=29, _F(9)=26, _R(7)=15
      [29, 26, 15],
      [27, 44, 24], // DLF _D(1)=27 _L(9)=44 _F(7)=24
      [33, 53, 42], // DBL
      [35, 17, 51], // DRB
    ];
    // Fix ULB/UBR from cubejs:
    // ULB: _U(1)=0, _L(1)=36, _B(3)=47
    // UBR: _U(3)=2, _B(1)=45, _R(3)=11
    const cornerList = [
      [8, 9, 20],
      [6, 18, 38],
      [0, 36, 47],
      [2, 45, 11],
      [29, 26, 15],
      [27, 44, 24],
      [33, 53, 42],
      [35, 17, 51],
    ];
    const edgeList = [
      [5, 10], // UR _U(6)=5 _R(2)=10
      [7, 19], // UF
      [3, 37], // UL
      [1, 46], // UB
      [32, 16], // DR
      [28, 25], // DF
      [30, 43], // DL
      [34, 52], // DB
      [23, 12], // FR _F(6)=23 _R(4)=12
      [21, 41], // FL
      [50, 39], // BL
      [48, 14], // BR
    ];
    for (const idxs of cornerList) {
      const cols = idxs.map((i) => facelets[i]).sort().join("");
      if (cols === "GOW") idxs.forEach((i) => set.add(i));
    }
    for (const idxs of edgeList) {
      const cols = idxs.map((i) => facelets[i]).sort().join("");
      if (cols === "GO") idxs.forEach((i) => set.add(i));
    }
    return set;
  }

  global.CubeEngine = {
    COLOR_HEX,
    FACE_TO_COLOR,
    expandRepeats,
    invertAlg,
    applyAlg,
    faceletsFromAlg,
    solvedFacelets,
    highlightFR,
    /** state after setup alg from solved */
    stateAfterSetup(setupAlg) {
      return faceletsFromAlg(setupAlg || "");
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
