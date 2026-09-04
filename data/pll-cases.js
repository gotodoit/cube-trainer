/**
 * PLL 图鉴数据 —— T / Jb / Ja / Y / F 五种
 * setupAlg 由 invertAlg(solveAlg) 自动生成
 */
(function (global) {
  const RAW = [
    {
      id: "pll-T",
      name: "T Perm",
      description: "对角互换：UFR↔UBL 角 + UF↔UB 棱",
      recognition: "前后各有「头灯」——F 和 B 面上各有两个同色贴纸并排；左右各错一个",
      solveAlg: "R U R' U' R' F R2 U' R' U' R U R' F'",
      altAlgs: [],
    },
    {
      id: "pll-Jb",
      name: "Jb Perm",
      description: "右侧相邻互换：UFR↔UBR 角 + UF↔UR 棱",
      recognition: "R 面有「头灯」——右侧两个同色贴纸并排；F 面右角颜色对了但 B 面右角错",
      solveAlg: "R U R' F' R U R' U' R' F R2 U' R'",
      altAlgs: [],
    },
    {
      id: "pll-Ja",
      name: "Ja Perm",
      description: "左侧相邻互换：UFR↔UFL 角 + UF↔UL 棱（Jb 的左手镜像）",
      recognition: "L 面有「头灯」——左侧两个同色贴纸并排；F 面左角颜色对了但 B 面左角错",
      solveAlg: "L' U' L F L' U' L U L F' L2 U L",
      altAlgs: [],
    },
    {
      id: "pll-Y",
      name: "Y Perm",
      description: "对角互换：UFR↔UBL 角 + UL↔UR 棱（角同 T，棱不同）",
      recognition: "F 面：左右两角颜色一样（头灯）但不是中间面的颜色；B 面同理；左右棱也错",
      solveAlg: "F R U' R' U' R U R' F' R U R' U' R' F R F'",
      altAlgs: [],
    },
    {
      id: "pll-F",
      name: "F Perm",
      description: "三角 + 三棱循环：UFR→UFL→UBR（角）+ UF→UL→UB（棱）",
      recognition: "较复杂：一面左角颜色正确，邻面右角颜色正确，其余均错；先识别哪两个角对",
      solveAlg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R",
      altAlgs: [],
    },
  ];

  function getCases() {
    return RAW.map((c) => ({
      ...c,
      setupAlg: CubeEngine.invertAlg(c.solveAlg),
    }));
  }

  function getById(id) {
    return getCases().find((c) => c.id === id);
  }

  global.PLLData = { RAW, getCases, getById };
})(typeof window !== "undefined" ? window : globalThis);
