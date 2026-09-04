const assert = require("node:assert/strict");
const vm = require("node:vm");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
global.Cube = require(path.join(root, "lib/cubejs.js"));

function load(rel) {
  vm.runInThisContext(fs.readFileSync(path.join(root, rel), "utf8"), {
    filename: rel,
  });
}

load("lib/cube.js");
load("data/f2l-cases.js");
load("data/pll-cases.js");
load("data/plans.js");

const solved = new Cube().asString();
const cases = F2LData.getCases();
assert.equal(cases.length, 41, "应包含完整 41 例 F2L");

function isSolvedIgnoringOrientation(cube) {
  const state = cube.asString();
  return Array.from({ length: 6 }, (_, face) =>
    state.slice(face * 9, face * 9 + 9)
  ).every((stickers) => [...stickers].every((sticker) => sticker === stickers[0]));
}

for (const c of cases) {
  const cube = CubeEngine.applyAlg(c.setupAlg);
  cube.move(CubeEngine.expandRepeats(c.solveAlg));
  assert.equal(
    cube.asString(),
    solved,
    `${c.id}：复现后执行还原公式应恢复整个魔方`
  );

  for (const altAlg of c.altAlgs || []) {
    const altCube = CubeEngine.applyAlg(c.setupAlg);
    altCube.move(CubeEngine.expandRepeats(altAlg));
    assert.ok(
      isSolvedIgnoringOrientation(altCube),
      `${c.id}：替代公式 ${altAlg} 应从同一图示朝向完成还原`
    );
  }
}

const fingerTask = PlanData.CROSS_DAYS["1-2"].tasks.find(
  (task) => task.id === "cross-finger"
);
const sexyTask = PlanData.CROSS_DAYS["3-4"].tasks.find(
  (task) => task.id === "cross-sexy"
);
assert.equal(fingerTask.go, "finger", "手法 5 分钟应跳到手法练习区");
assert.equal(sexyTask.go, "finger", "Sexy 连做应跳到手法练习区");

// ── PLL 校验 ──
const pllCases = PLLData.getCases();
assert.equal(pllCases.length, 5, "应包含 5 种 PLL");

for (const c of pllCases) {
  const cube = CubeEngine.applyAlg(c.setupAlg);
  cube.move(CubeEngine.expandRepeats(c.solveAlg));
  assert.equal(
    cube.asString(),
    solved,
    `${c.id}（${c.name}）：setupAlg + solveAlg 应还原整个魔方`
  );
}

console.log(`PASS: ${cases.length} 条 F2L 公式 + ${pllCases.length} 条 PLL 公式 + 手法跳转 全部通过`);
