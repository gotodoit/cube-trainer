(function (global) {
  const KEY = "cube_mobile_trainer_v1";

  function todayKey() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function defaultData() {
    return {
      version: 1,
      planChecks: {}, // { "2026-08-31": { "cross-d12-1": true } }
      crossTimes: [], // { t, ms, date }
      f2lTimes: [], // { t, ms, date, mode: "full"|"case", caseId? }
      casePractice: {}, // { caseId: count }
      pllPractice: {}, // { pll-T: count, ... }
      recognitionQuiz: { total: 0, correct: 0, byDate: {} }, // byDate: { "2026-09-02": { total, correct } }
      stageDay: 1, // 1-7 for cross week suggestion
      f2lDay: 1,
    };
  }

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultData();
      return Object.assign(defaultData(), JSON.parse(raw));
    } catch {
      return defaultData();
    }
  }

  function save(data) {
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  function exportJSON(data) {
    return JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        app: "cube-mobile-trainer",
        ...data,
      },
      null,
      2
    );
  }

  function parseImport(text) {
    const obj = JSON.parse(text);
    if (!obj || typeof obj !== "object") throw new Error("无效 JSON");
    const base = defaultData();
    return {
      version: 1,
      planChecks: obj.planChecks || base.planChecks,
      crossTimes: Array.isArray(obj.crossTimes) ? obj.crossTimes : base.crossTimes,
      f2lTimes: Array.isArray(obj.f2lTimes) ? obj.f2lTimes : base.f2lTimes,
      casePractice: obj.casePractice || base.casePractice,
      pllPractice: obj.pllPractice || base.pllPractice,
      recognitionQuiz: obj.recognitionQuiz || base.recognitionQuiz,
      stageDay: obj.stageDay || 1,
      f2lDay: obj.f2lDay || 1,
    };
  }

  global.StorageAPI = {
    KEY,
    todayKey,
    defaultData,
    load,
    save,
    exportJSON,
    parseImport,
  };
})(typeof window !== "undefined" ? window : globalThis);
