import GLPK, { type LP, type Result } from 'glpk.js/node';

(async () => {
  const glpk = await GLPK();

  const students = Array.from({ length: 20 }, (_, i) => `S${i}`);
  const groups = ['G0', 'G1', 'G2', 'G3'] as const;

  // 属性A（例：女子）
  const attrA = new Set(['S0','S1','S2','S3','S4','S5','S6','S7']);

  // 変数 x[i][g] = 生徒iがグループgに属する
  const vars: { name: string; coef: number }[] = [];
  const binaries: string[] = [];

  for (const s of students) {
    for (const g of groups) {
      const name = `x_${s}_${g}`;
      vars.push({ name, coef: 0 });
      binaries.push(name);
    }
  }

  const subjectTo: LP['subjectTo'] = [];

  // 1人1グループ
  for (const s of students) {
    subjectTo.push({
      name: `assign_${s}`,
      vars: groups.map(g => ({ name: `x_${s}_${g}`, coef: 1 })),
      bnds: { type: glpk.GLP_FX, lb: 1, ub: 1 }
    });
  }

  // 各グループ5人
  for (const g of groups) {
    subjectTo.push({
      name: `size_${g}`,
      vars: students.map(s => ({ name: `x_${s}_${g}`, coef: 1 })),
      bnds: { type: glpk.GLP_FX, lb: 5, ub: 5 }
    });
  }

  // S0 と S1 は同じグループ
  for (const g of groups) {
    subjectTo.push({
      name: `close_S0_S1_${g}`,
      vars: [
        { name: `x_S0_${g}`, coef: 1 },
        { name: `x_S1_${g}`, coef: -1 }
      ],
      bnds: { type: glpk.GLP_FX, lb: 0, ub: 0 }
    });
  }

  // S2 と S3 は別グループ
  for (const g of groups) {
    subjectTo.push({
      name: `far_S2_S3_${g}`,
      vars: [
        { name: `x_S2_${g}`, coef: 1 },
        { name: `x_S3_${g}`, coef: 1 }
      ],
      bnds: { type: glpk.GLP_UP, lb: 0, ub: 1 }
    });
  }

  // 属性Aは各グループ1〜3人
  for (const g of groups) {
    subjectTo.push({
      name: `attrA_min_${g}`,
      vars: Array.from(attrA).map(s => ({ name: `x_${s}_${g}`, coef: 1 })),
      bnds: { type: glpk.GLP_LO, lb: 1, ub: Number.MAX_VALUE }
    });

    subjectTo.push({
      name: `attrA_max_${g}`,
      vars: Array.from(attrA).map(s => ({ name: `x_${s}_${g}`, coef: 1 })),
      bnds: { type: glpk.GLP_UP, lb: 0, ub: 3 }
    });
  }

  const lp: LP = {
    name: 'seat_grouping',
    objective: {
      direction: glpk.GLP_MIN,
      name: 'obj',
      vars
    },
    subjectTo,
    binaries
  };

  const res: Result = glpk.solve(lp, glpk.GLP_MSG_OFF);

  // 結果表示
  const result: Record<string, string[]> = {};
  for (const g of groups) result[g] = [];

  for (const s of students) {
    for (const g of groups) {
      const v = res.result.vars[`x_${s}_${g}`];
      if (v === 1) result[g].push(s);
    }
  }

  console.log('=== 結果 ===');
  console.log(result);
})();
