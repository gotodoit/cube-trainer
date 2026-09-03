/**
 * 今日计划模板：十字周 (Day1–7) + F2L 组 1–12 专项（14 天循环）。
 */
(function (global) {
  const CROSS_DAYS = {
    "1-2": {
      label: "Day 1–2 · 观察与规划",
      tasks: [
        { id: "cross-observe", title: "十字单项 10 分钟", detail: "打乱 → 观察 15 秒 → 只做十字。观察时至少计划 2 条白棱", go: "cross" },
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
        { id: "cross-speed", title: "十字单项目标 < 10 秒", detail: "做完十字立刻找下一组块，不发呆", go: "cross" },
        { id: "cross-link", title: "衔接意识", detail: "十字最后一步时眼睛已在找第一组 F2L", go: "cross" },
      ],
    },
    "7": {
      label: "Day 7 · 阶段测试",
      tasks: [
        { id: "cross-test10", title: "连续 10 次十字，平均 < 8 秒", detail: "用本页计时，看今日平均", go: "cross" },
        { id: "cross-y01", title: "至少 5 次转体 0–1 次", detail: "自己心里记转体次数", go: "cross" },
      ],
    },
  };

  const F2L_FOCUS = [
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

  function crossBucket(day) {
    if (day <= 2) return "1-2";
    if (day <= 4) return "3-4";
    if (day <= 6) return "5-6";
    return "7";
  }

  function buildToday(stageDay, f2lDay) {
    const bucket = crossBucket(stageDay);
    const cross = CROSS_DAYS[bucket];
    const f2l = F2L_FOCUS[(f2lDay - 1) % F2L_FOCUS.length];
    const tasks = [
      ...cross.tasks.map((t) => ({ ...t, section: "十字" })),
      {
        id: `f2l-focus-${f2l.day}`,
        title: f2l.title,
        detail: `练组 ${f2l.groups.join("、")}：先用「认图练习」闭卷认组，再对着练`,
        go: "f2l",
        section: "F2L",
        groups: f2l.groups,
        scrollQuiz: true,
      },
      {
        id: `f2l-quiz-${f2l.day}`,
        title: "认图练习 10 题",
        detail: "随机出图 → 先选第几组 → 揭晓后再选具体哪一种",
        go: "f2l-quiz",
        section: "F2L",
        groups: f2l.groups,
      },
      {
        id: `f2l-timer-${f2l.day}`,
        title: "F2L 四组单项计时 1 次",
        detail: "十字做好后开始计时，四组插完停下（慢没关系）",
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
    F2L_FOCUS,
    crossBucket,
    buildToday,
  };
})(typeof window !== "undefined" ? window : globalThis);
