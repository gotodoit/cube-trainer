/**
 * 魔方小站 F2L 全套 41 例（组 1–12）。槽位固定右前 FR，黄顶绿前。
 * setupAlg = 从还原态拧到该情况；solveAlg = 还原公式。
 * recognition = 看图特征（位置·连接·白角·棱块·组内区分）
 */
(function (global) {
  const RAW = [
    // ── 第 1 组：四种基本插入（已配对）──
    {
      id: "g1-1",
      group: 1,
      name: "已配对 · 白朝右",
      recognition: "都在 U 层 · 相连 · 白角朝 R（右面见白）· 用右手 R U R'",
      solveAlg: "R U R'",
      altAlgs: [],
    },
    {
      id: "g1-2",
      group: 1,
      name: "已配对 · 白朝前",
      recognition: "都在 U 层 · 相连 · 白角朝 F（前面；立体图里在左侧）· 用前插 F' U' F，或转体后左手 y' R' U' R",
      solveAlg: "F' U' F",
      altAlgs: ["y' R' U' R"],
    },
    {
      id: "g1-3",
      group: 1,
      name: "基本插入 · 第三式",
      recognition: "角棱已形成一对 · 位于 FR 附近 · 用 F R' F' R 插入",
      solveAlg: "F R' F' R",
      altAlgs: [],
    },
    {
      id: "g1-4",
      group: 1,
      name: "基本插入 · 第四式",
      recognition: "角棱已形成一对 · 位于 FR 附近 · 用 U R U' R' 插入",
      solveAlg: "U R U' R'",
      altAlgs: [],
    },

    // ── 第 2 组：顶层分开 → 基本 1/2 ──
    {
      id: "g2-1",
      group: 2,
      name: "分开 · 角在右前上",
      recognition: "都在 U 层 · 分开 · 角在 U 右前、棱在 U 右侧 · 白角朝侧面 · 拧成白朝前后 R U R'",
      solveAlg: "U' R U R' U R U R'",
      altAlgs: [],
    },
    {
      id: "g2-2",
      group: 2,
      name: "分开 · d 藏棱再插",
      recognition: "都在 U 层 · 分开 · 棱在 U 前、角在 U 右前 · 需 d 转中层再插",
      solveAlg: "d R' U2 R d' R U R'",
      altAlgs: [],
    },
    {
      id: "g2-3",
      group: 2,
      name: "分开 · 角在右后",
      recognition: "都在 U 层 · 分开 · 角在 U 右后、棱在 U 右 · 白朝侧面 · U' 对位后插",
      solveAlg: "U' R U' R' U R U R'",
      altAlgs: [],
    },
    {
      id: "g2-4",
      group: 2,
      name: "分开 · 角在左前",
      recognition: "都在 U 层 · 分开 · 角在 U 左前、棱在 U 前 · 镜像于 g2-3 · 可 y' 左路",
      solveAlg: "U y' R' U' R U' R' U' R",
      altAlgs: [],
    },
    {
      id: "g2-5",
      group: 2,
      name: "分开 · U' 藏角",
      recognition: "都在 U 层 · 分开 · 角在 U 右前、棱在 U 前 · 先 U' 藏角再 d 接棱",
      solveAlg: "U' R U2 R' d R' U' R",
      altAlgs: [],
    },
    {
      id: "g2-6",
      group: 2,
      name: "分开 · d 左路",
      recognition: "都在 U 层 · 分开 · 角在 U 左前、棱在 U 左 · d 起手 · 拧成白朝右类",
      solveAlg: "d R' U R U' R' U' R",
      altAlgs: [],
    },

    // ── 第 3 组：顶层分开 → 基本 3/4 ──
    {
      id: "g3-1",
      group: 3,
      name: "分开 · 双 U2 右",
      recognition: "都在 U 层 · 分开 · 角在 U 右后、棱在 U 右 · 需两次 U2 对位 · 落第 3 基本式",
      solveAlg: "U' R U2 R' U2 R U' R'",
      altAlgs: [],
    },
    {
      id: "g3-2",
      group: 3,
      name: "分开 · Sexy 双次",
      recognition: "都在 U 层 · 分开 · 角在 U 右前上方、棱在 U 右 · 连做两次 R U 系",
      solveAlg: "U' R U R' U2 R U' R'",
      altAlgs: [],
    },
    {
      id: "g3-3",
      group: 3,
      name: "分开 · d 双 U2 左",
      recognition: "都在 U 层 · 分开 · 角在 U 左后、棱在 U 左 · d 起手 + 双 U2 · 镜像 g3-1",
      solveAlg: "d R' U2 R U2 R' U R",
      altAlgs: [],
    },
    {
      id: "g3-4",
      group: 3,
      name: "分开 · d 落第 4 式",
      recognition: "都在 U 层 · 分开 · 角在 U 左前、棱在 U 左 · d 起手 · 落第 4 基本式",
      solveAlg: "d R' U' R U2 R' U R",
      altAlgs: [],
    },

    // ── 第 4 组：白朝上且分开 ──
    {
      id: "g4-1",
      group: 4,
      name: "白朝上分开 · 角右前",
      recognition: "都在 U 层 · 分开 · 白角朝 U · 角在 U 右前、棱在 U 右 · y' 左路",
      solveAlg: "y' U' R' U2 R U' R' U R",
      altAlgs: [],
    },
    {
      id: "g4-2",
      group: 4,
      name: "白朝上分开 · 角右后",
      recognition: "都在 U 层 · 分开 · 白角朝 U · 角在 U 右后、棱在 U 右 · U R U2 R' 系",
      solveAlg: "U R U2 R' U R U' R'",
      altAlgs: [],
    },
    {
      id: "g4-3",
      group: 4,
      name: "白朝上分开 · 角左后",
      recognition: "都在 U 层 · 分开 · 白角朝 U · 角在 U 左后、棱在 U 左 · U2 起手",
      solveAlg: "U2 R U R' U R U' R'",
      altAlgs: [],
    },
    {
      id: "g4-4",
      group: 4,
      name: "白朝上分开 · 角左前",
      recognition: "都在 U 层 · 分开 · 白角朝 U · 角在 U 左前、棱在 U 左 · y' U2 左路",
      solveAlg: "y' U2 R' U' R U' R' U R",
      altAlgs: [],
    },

    // ── 第 5 组：交叉 ──
    {
      id: "g5-1",
      group: 5,
      name: "交叉 · 角右前棱左前",
      recognition: "都在 U 层 · 交叉相对 · 角在 U 右前、棱在 U 左前 · 先 R 系再 F' U F",
      solveAlg: "U R U' R' U' F' U F",
      altAlgs: [],
    },
    {
      id: "g5-2",
      group: 5,
      name: "交叉 · 角左前棱右前",
      recognition: "都在 U 层 · 交叉相对 · 角在 U 左前、棱在 U 右前 · 镜像 g5-1",
      solveAlg: "U' F' U F U R U' R'",
      altAlgs: [],
    },

    // ── 第 6 组：棱在中层、角在顶白朝侧 ──
    {
      id: "g6-1",
      group: 6,
      name: "中层棱 · 角右前异色",
      recognition: "棱在 E 层（中层）· 角在 U 右前 · 白角朝侧面 · 角棱侧面异色 · d 藏角",
      solveAlg: "d R' U' R d' R U R'",
      altAlgs: [],
    },
    {
      id: "g6-2",
      group: 6,
      name: "中层棱 · 角右后异色",
      recognition: "棱在 E 层 · 角在 U 右后 · 白角朝侧面 · 角棱侧面异色 · U' 起手",
      solveAlg: "U' R U R' d R' U' R",
      altAlgs: [],
    },
    {
      id: "g6-3",
      group: 6,
      name: "中层棱 · 角右前同色",
      recognition: "棱在 E 层 · 角在 U 右前 · 白角朝侧面 · 角棱侧面同色 · U' R U2 R'",
      solveAlg: "U' R U2 R' U R U R'",
      altAlgs: [],
    },
    {
      id: "g6-4",
      group: 6,
      name: "中层棱 · 角右后同色",
      recognition: "棱在 E 层 · 角在 U 右后 · 白角朝侧面 · 角棱侧面同色 · U' R U' R' U2",
      solveAlg: "U' R U' R' U2 R U' R'",
      altAlgs: [],
    },

    // ── 第 7 组：藏棱 180° ──
    {
      id: "g7-1",
      group: 7,
      name: "藏棱 180° · 右路",
      recognition: "角在 U · 棱在 E 层 FR 位 · 角要越过棱头顶 180° · R U2 R' 起手",
      solveAlg: "R U2 R' U' R U R'",
      altAlgs: [],
    },
    {
      id: "g7-2",
      group: 7,
      name: "藏棱 180° · 左路",
      recognition: "角在 U · 棱在 E 层 FL 位 · 越过棱头顶 180° · y' 镜像 g7-1",
      solveAlg: "y' R' U2 R U R' U' R",
      altAlgs: [],
    },

    // ── 第 8 组：藏棱 90° ──
    {
      id: "g8-1",
      group: 8,
      name: "藏棱 90° · 右路",
      recognition: "角在 U · 棱在 E 层 · 越过棱头顶 90°（不是 180°）· R U' R' U d",
      solveAlg: "R U' R' U d R' U' R",
      altAlgs: [],
    },
    {
      id: "g8-2",
      group: 8,
      name: "藏棱 90° · 左路",
      recognition: "角在 U · 棱在 E 层 · 越过棱头顶 90° · y' 镜像 g8-1",
      solveAlg: "y' R' U R U' d' R U R'",
      altAlgs: [],
    },

    // ── 第 9 组：一上一下、白朝上 ──
    {
      id: "g9-1",
      group: 9,
      name: "上角下棱 · 白朝上",
      recognition: "角在 U · 棱在 D 层（下方）· 白角朝 U · 角在上棱在下",
      solveAlg: "R U' R' d R' U R",
      altAlgs: [],
    },
    {
      id: "g9-2",
      group: 9,
      name: "上角下棱 · 白朝上长式",
      recognition: "角在 U · 棱在 D 层 · 白角朝 U · 与 g9-1 同类 · 三次 R U R' U'",
      solveAlg: "R U R' U' R U R' U' R U R'",
      altAlgs: [],
    },

    // ── 第 10 组：角在底层、棱在顶 ──
    {
      id: "g10-1",
      group: 10,
      name: "下角上棱 · 同色",
      recognition: "角在 D 层 FR 位 · 棱在 U · 白角朝侧面 · 底角可见色与顶棱同色",
      solveAlg: "R U' R' U R U' R'",
      altAlgs: [],
    },
    {
      id: "g10-2",
      group: 10,
      name: "下角上棱 · 同色左路",
      recognition: "角在 D 层 FL 位 · 棱在 U · 白角朝侧面 · 底角与顶棱同色 · y' 路",
      solveAlg: "y' R' U R U' R' U R",
      altAlgs: [],
    },
    {
      id: "g10-3",
      group: 10,
      name: "下角上棱 · 异色",
      recognition: "角在 D 层 FR 位 · 棱在 U · 白角朝侧面 · 底角可见色与顶棱异色",
      solveAlg: "R U R' U' R U R'",
      altAlgs: [],
    },
    {
      id: "g10-4",
      group: 10,
      name: "下角上棱 · 异色左路",
      recognition: "角在 D 层 FL 位 · 棱在 U · 白角朝侧面 · 底角与顶棱异色 · y 路",
      solveAlg: "y L' U' L U L' U' L",
      altAlgs: ["y' R' U' R U R' U' R"],
    },

    // ── 第 11 组：白朝上且相连 ──
    {
      id: "g11-1",
      group: 11,
      name: "白朝上相连 · 标准",
      recognition: "都在 U 层 · 相连（不是分开！）· 白角朝 U · 侧面同色 · 与第 4 组区别：4 组是分开",
      solveAlg: "R U R' d R' U R U' R' U R",
      altAlgs: [],
    },
    {
      id: "g11-2",
      group: 11,
      name: "白朝上相连 · U2 路",
      recognition: "都在 U 层 · 相连 · 白角朝 U · 侧面同色 · 角棱在 U 呈「横条」· U2 R2 系",
      solveAlg: "U2 R2 U2 R' U' R U' R2",
      altAlgs: [],
    },

    // ── 第 12 组：已在槽位但错向 ──
    {
      id: "g12-1",
      group: 12,
      name: "错槽 · 角反棱正",
      recognition: "都在下两层 · 已在 FR 槽位 · 角块反插/方向错 · 需 R U' R' U R U2 R'",
      solveAlg: "R U' R' U R U2 R' U R U' R'",
      altAlgs: [],
    },
    {
      id: "g12-2",
      group: 12,
      name: "错槽 · 藏棱取出",
      recognition: "都在下两层 · 已在 FR 槽位 · 棱块方向错 · d 藏棱再取出重插",
      solveAlg: "R U' R' U d R' U' R U' R' U R",
      altAlgs: [],
    },
    {
      id: "g12-3",
      group: 12,
      name: "错槽 · 双 U'",
      recognition: "都在下两层 · 已在 FR 槽位 · 角棱都错 · R U' R' U' R U R' U2",
      solveAlg: "R U' R' U' R U R' U2 R U' R'",
      altAlgs: [],
    },
    {
      id: "g12-4",
      group: 12,
      name: "错槽 · F 取出",
      recognition: "都在下两层 · 已在 FR 槽位 · 需 F' U' F 取出再插",
      solveAlg: "R U' R' U' R U' R' U F' U' F",
      altAlgs: [],
    },
    {
      id: "g12-5",
      group: 12,
      name: "错槽 · 双 U2 取出",
      recognition: "都在下两层 · 已在 FR 槽位 · 角棱深插 · (R U' U' R' U)2 取出",
      solveAlg: "(R U' U' R' U)2 y' R' U' R",
      altAlgs: [],
    },
  ];

  const GROUP_META = {
    1: {
      title: "第 1 组 · 四种基本插入",
      blurb: "都在顶层且已配对。看白角朝 F / R / 里 / U 四向。",
      decision: "顶层 · 相连 · 白角朝侧面或朝里",
    },
    2: {
      title: "第 2 组 · 转基本 1/2",
      blurb: "顶层分开，拧完后变成「白朝前/右」再插。",
      decision: "顶层 · 分开 · 目标落第 1/2 种配对（白朝 F 或 R）",
    },
    3: {
      title: "第 3 组 · 转基本 3/4",
      blurb: "顶层分开，拧完后变成「白朝里/上」再插。",
      decision: "顶层 · 分开 · 目标落第 3/4 种配对（白朝里或 U）",
    },
    4: {
      title: "第 4 组 · 白朝上分开",
      blurb: "角白朝天、两块分开。和「白朝天且贴在一起」不是同一类。",
      decision: "顶层 · 分开 · 白角朝天",
    },
    5: {
      title: "第 5 组 · 交叉",
      blurb: "两块在顶呈对角/交叉相对，不是并排。",
      decision: "顶层 · 交叉相对（角在一角、棱在对角位置）",
    },
    6: {
      title: "第 6 组 · 棱在中层",
      blurb: "棱卡在 E 层，角在顶层白朝侧面。",
      decision: "棱在中层 E · 角在 U · 白角朝侧面",
    },
    7: {
      title: "第 7 组 · 藏棱 180°",
      blurb: "角在顶、棱在中层，角越过棱头顶转 180°。",
      decision: "角 U + 棱 E · 藏棱时角转 180°",
    },
    8: {
      title: "第 8 组 · 藏棱 90°",
      blurb: "同类但只转 90°，与第 7 组手感不同。",
      decision: "角 U + 棱 E · 藏棱时角只转 90°",
    },
    9: {
      title: "第 9 组 · 上角下棱",
      blurb: "角在顶、棱在底层，白角朝上。",
      decision: "角在 U · 棱在 D · 白角朝 U",
    },
    10: {
      title: "第 10 组 · 下角上棱",
      blurb: "角在底层、棱在顶，白角朝侧面。",
      decision: "角在 D · 棱在 U · 白角朝侧面",
    },
    11: {
      title: "第 11 组 · 白朝上相连",
      blurb: "角白朝天且与棱贴在一起。和「白朝天但两块分开」不是同一类。",
      decision: "顶层 · 相连 · 白角朝天",
    },
    12: {
      title: "第 12 组 · 错槽",
      blurb: "角棱已在 FR 槽但方向/位置错误，要先取出。",
      decision: "都在下两层 · 已在目标槽 FR · 未正确插入",
    },
  };

  /** 实战决策树：只看块的位置，不记组号 */
  const DECISION_TREE = [
    { q: "先看：这两块分别在哪？", a: [
      "都在顶层 → 再看它们贴没贴在一起（下面①或②）",
      "一块在槽里、另一块在顶层或中层 → 走③",
      "两块都卡在同一个槽里、颜色却不对 → 先取出，再当顶层情况处理",
    ]},
    { q: "① 都在顶层，而且已经贴在一起", a: [
      "先看这对有没有对着要插的空槽：没有 → 只转顶层，转到槽口再动手",
      "白贴纸在侧面或朝自己 → 直接插入（常见是 R U R' 或 F' U' F）",
      "白贴纸朝天 → 先转顶层找插入角度；插不进再拆开",
      "颜色贴在一起，但插进去会错色（假配对）→ 拆开，按②处理",
      "口诀：能插就插 · 对不齐先转顶层 · 还不行再拆",
    ]},
    { q: "② 都在顶层，但是分开的", a: [
      "别先盯白朝哪。先看：两块是并排分开，还是对角交叉",
      "对角交叉（角在一个角、棱在对面）→ 先转顶层，让它们靠近，再配对",
      "分开、白朝天 → 用顶层把棱转到角旁边，连上再插",
      "分开、白朝侧面 → 转顶层把角和棱凑近；凑成「可贴住再插入」再动手",
      "空槽还多：按你的理解配对即可。拧两下仍散 → 停手，只问「能不能用一次顶层转把它们贴上」",
    ]},
    { q: "③ 有一块已经在槽里", a: [
      "先出槽：只拧当前这个槽的那一侧，出完立刻停手",
      "停下来看顶层：转一次顶层，角和棱能不能贴在一起、并且对着空槽？",
      "能贴上 → 先转顶层配对，再插入（通常比继续拆更短）",
      "贴不上 → 再取一次或拆开，变成「两块都在顶层」，回到①或②",
      "棱卡在中层（槽的腰上）→ 先把棱带出来，再跟顶层的角配对",
      "角在底下、棱在顶上（或反过来）→ 先把底下那块取到顶层，再配对",
      "口诀：出槽 → 停 → 转顶层能不能配对？能就转，不能再拆",
    ]},
  ];

  function withSetup(cases) {
    return cases.map((c) => ({
      ...c,
      setupAlg: c.setupAlg != null ? c.setupAlg : CubeEngine.invertAlg(c.solveAlg),
    }));
  }

  function byGroup(cases) {
    const map = {};
    for (const c of cases) {
      if (!map[c.group]) map[c.group] = [];
      map[c.group].push(c);
    }
    return map;
  }

  function getGroupNumbers() {
    return Object.keys(GROUP_META)
      .map(Number)
      .sort((a, b) => a - b);
  }

  global.F2LData = {
    RAW,
    GROUP_META,
    DECISION_TREE,
    getGroupNumbers,
    getCases() {
      return withSetup(RAW);
    },
    byGroup() {
      return byGroup(withSetup(RAW));
    },
    getById(id) {
      return withSetup(RAW).find((c) => c.id === id);
    },
    getByGroup(g) {
      return withSetup(RAW).filter((c) => c.group === g);
    },
  };
})(typeof window !== "undefined" ? window : globalThis);
