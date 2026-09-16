/**
 * 今日计划：十字周 (Day1–7) + F2L 易混对照（7 天循环）。
 * 旧的 14 天按组认图计划保留在 F2L_FOCUS_LEGACY，图鉴里仍可按组查阅。
 */
(function (global) {
  const CROSS_DAYS = {
    "1-2": {
      label: "Day 1–2 · 观察与规划",
      tasks: [
        { id: "cross-observe", title: "十字单项 8–10 分钟", detail: "打乱 → 观察 15 秒 → 只做十字。观察时至少计划 2 条白棱", go: "cross" },
        { id: "cross-finger", title: "手法 5 分钟", detail: "Sexy R U R' U' 连做 20 次，要求不锁死", go: "finger" },
      ],
    },
    "3-4": {
      label: "Day 3–4 · 减少转体",
      tasks: [
        { id: "cross-y2", title: "十字单项（转体 ≤ 2）", detail: "每次 y/y' 心里计数，目标大多数 ≤ 2 次", go: "cross" },
        { id: "cross-sexy", title: "Sexy 连做", detail: "R U R' U' × 20，节奏均匀", go: "finger" },
      ],
    },
    "5-6": {
      label: "Day 5–6 · 提速与衔接",
      tasks: [
        { id: "cross-speed", title: "十字单项，少停顿", detail: "做完十字立刻找第一对，不发呆。速度其次", go: "cross" },
        { id: "cross-link", title: "衔接意识", detail: "十字最后一步时眼睛已在找第一对 F2L", go: "cross" },
      ],
    },
    "7": {
      label: "Day 7 · 看看平均",
      tasks: [
        { id: "cross-test10", title: "连续若干次十字，看今日平均", detail: "用本页计时即可；< 8 秒是远期目标，现在不必强求", go: "cross" },
        { id: "cross-y01", title: "心里记转体次数", detail: "能 0–1 次最好，做不到也不用重练一整天", go: "cross" },
      ],
    },
  };

  /** 旧 14 天按组计划（今日不再布置；图鉴仍按组陈列） */
  const F2L_FOCUS_LEGACY = [
    { day: 1, groups: [1], title: "F2L：第 1 组四种基本插入" },
    { day: 2, groups: [1, 2], title: "F2L：第 1 组复习 + 第 2 组" },
    { day: 3, groups: [2, 3], title: "F2L：第 2–3 组（顶层分开）" },
    { day: 4, groups: [4], title: "F2L：第 4 组白朝上分开" },
    { day: 5, groups: [5, 4], title: "F2L：第 5 组交叉 + 复习第 4" },
    { day: 6, groups: [11], title: "F2L：第 11 组白朝上相连" },
    { day: 7, groups: [6], title: "F2L：第 6 组棱在中层" },
    { day: 8, groups: [7, 8], title: "F2L：第 7–8 组藏棱" },
    { day: 9, groups: [9, 10], title: "F2L：第 9–10 组上下分布" },
    { day: 10, groups: [12], title: "F2L：第 12 组错槽" },
    { day: 11, groups: [1, 2, 3, 4, 5], title: "F2L：组 1–5 混合认图" },
    { day: 12, groups: [6, 7, 8, 9, 10, 11, 12], title: "F2L：组 6–12 混合认图" },
    { day: 13, groups: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], title: "F2L：全组混合认图" },
    { day: 14, groups: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], title: "F2L：四组计时 + 弱项复练" },
  ];

  const F2L_CONTRAST = [
    {
      day: 1,
      groups: [1, 11],
      title: "对照：已贴住 · 白在侧面 vs 白朝天",
      detail: "从图鉴里找两张「顶层贴住」的图。先说第一步（直接插 / 先转顶层），再说白朝哪。来回对照，不必做选择题。",
    },
    {
      day: 2,
      groups: [1, 2, 4, 11],
      title: "对照：顶层贴住 vs 分开",
      detail: "只练这一处差别：两块贴在一起，还是分开。贴住 → 对齐槽再插；分开 → 先转顶层凑近。",
    },
    {
      day: 3,
      groups: [2, 3, 4, 5],
      title: "对照：顶层分开 · 并排 vs 对角",
      detail: "两块都在顶、没贴住时：是并排分开，还是对角交叉。都是先转顶层靠近，不要一上来乱插。",
    },
    {
      day: 4,
      groups: [6, 9, 10, 12],
      title: "对照：一块在槽里 · 转顶层能否配对",
      detail: "出槽后停手。转一次顶层，角和棱能不能贴上？能就转再插；不能再拆。",
    },
    {
      day: 5,
      groups: [6, 7, 8],
      title: "对照：棱卡在腰上（中层）",
      detail: "棱在槽的腰上、角还在顶。先把棱带出来，再跟顶层的角配对，不要连着拧很多下。",
    },
    {
      day: 6,
      groups: [1, 12],
      title: "对照：真配对 vs 假配对",
      detail: "颜色贴在一起，插进去会对还是会错？真的 → 对齐就插；假的 → 先拆开。",
    },
    {
      day: 7,
      groups: [],
      title: "自由：昨天计时里混了哪对，就练哪对",
      detail: "四组计时里停最久或拧乱的那两种画面，打开图鉴对照。没有印象就复习「贴住 vs 分开」。",
    },
  ];

  function crossBucket(day) {
    if (day <= 2) return "1-2";
    if (day <= 4) return "3-4";
    if (day <= 6) return "5-6";
    return "7";
  }

  function clampF2lDay(day) {
    const n = F2L_CONTRAST.length;
    const d = parseInt(day, 10) || 1;
    return ((d - 1) % n + n) % n + 1;
  }

  function buildToday(stageDay, f2lDay) {
    const bucket = crossBucket(stageDay);
    const cross = CROSS_DAYS[bucket];
    const f2l = F2L_CONTRAST[clampF2lDay(f2lDay) - 1];
    const tasks = [
      ...cross.tasks.map((t) => ({ ...t, section: "十字" })),
      {
        id: `f2l-contrast-${f2l.day}`,
        title: f2l.title,
        detail: f2l.detail,
        go: "f2l",
        section: "F2L",
        groups: f2l.groups,
        scrollAtlas: true,
      },
      {
        id: `f2l-timer-${f2l.day}`,
        title: "F2L 四组计时 1～2 次",
        detail: "十字做好后开始，四组插完停下。当检验，40–50 秒也正常；少试错比抢秒数重要。",
        go: "f2l-timer",
        section: "F2L",
      },
    ];
    return {
      crossLabel: cross.label,
      f2lLabel: f2l.title,
      tasks,
      focusGroups: f2l.groups,
    };
  }

  global.PlanData = {
    CROSS_DAYS,
    F2L_CONTRAST,
    F2L_FOCUS_LEGACY,
    F2L_FOCUS: F2L_FOCUS_LEGACY,
    crossBucket,
    clampF2lDay,
    buildToday,
  };
})(typeof window !== "undefined" ? window : globalThis);
