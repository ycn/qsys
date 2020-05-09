window.questions = [
  {
    t: '题目一：计算某财务数据1的结果',
    q: '已知某公司数据A:{A},数据B:{B},数据C:{C}，求数据D、E',
    a: '数据D: {D}\n数据E: {E}',
    calc: function ({ A, B, C }) {
      return {
        D: A + B,
        E: (B * C) / 100,
      }
    },
  },
  {
    t: '题目二：计算某财务数据2的结果',
    q: '已知某公司数据A:{A:[0.5,0.4,0.3]},数据B:{B}，\n选择数据D的正确答案',
    a: '数据D:{D:[1.1,1.2,1.3]}',
    calc: function ({ A, B }) {
      return {
        D: A * A - Math.sqrt(B),
      }
    },
  },
]
