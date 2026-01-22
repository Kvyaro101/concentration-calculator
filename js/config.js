// config.js - Конфигурация веществ и параметры

const SUBSTANCES = {
  na2so4: {
    id: 'na2so4',
    name: 'Na₂SO₄ (дисульфат натрия)',
    mw: 142.04,
    category: 'salts',
    description: 'Салтинг-аут агент'
  },
  kcl: {
    id: 'kcl',
    name: 'KCl (хлорид калия)',
    mw: 74.55,
    category: 'salts',
    description: 'Электролит'
  },
  nacl: {
    id: 'nacl',
    name: 'NaCl (хлорид натрия)',
    mw: 58.44,
    category: 'salts',
    description: 'Физиологический раствор'
  },
  edta: {
    id: 'edta',
    name: 'EDTA (этилендиаминтетрауксусная кислота)',
    mw: 292.24,
    category: 'chelators',
    description: 'Хелатор'
  },
  tris: {
    id: 'tris',
    name: 'Tris (трометамол)',
    mw: 121.14,
    category: 'buffers',
    description: 'Буферный агент'
  },
};

const DEFAULT_STOCK_CONCENTRATION = 1.0; // М (по умолчанию)
const VOLUME_UNITS = {
  ml: { label: 'мл', factor: 1 },
  l: { label: 'л', factor: 1000 },
};
const MASS_UNITS = {
  g: { label: 'г', factor: 1 },
  mg: { label: 'мг', factor: 1000 },
};

// Стандартные формулы (ты их переопределишь)
const DEFAULT_FORMULAS = {
  // c = m / (M * V), где m в граммах, V в литрах
  // m = c * M * V / 1000, где V в мл, m в граммах
  
  /**
   * Расчёт требуемой массы вещества
   * @param volumeML - объём раствора в мл
   * @param concentrationM - целевая концентрация в М
   * @param molecularWeightG - молярная масса в г/моль
   * @returns масса в граммах
   */
  calculateRequiredMass: (volumeML, concentrationM, molecularWeightG) => {
    return (concentrationM * molecularWeightG * volumeML) / 1000;
  },

  /**
   * Расчёт реальной концентрации по внесённой массе
   * @param actualMassG - фактически внесённая масса в г
   * @param volumeML - объём раствора в мл
   * @param molecularWeightG - молярная масса в г/моль
   * @returns концентрация в М
   */
  calculateActualConcentration: (actualMassG, volumeML, molecularWeightG) => {
    return (actualMassG * 1000) / (molecularWeightG * volumeML);
  },

  /**
   * Расчёт относительной погрешности
   * @param requiredValue - требуемое значение
   * @param actualValue - фактическое значение
   * @returns погрешность в процентах
   */
  calculateErrorPercent: (requiredValue, actualValue) => {
    if (requiredValue === 0) return 0;
    return ((actualValue - requiredValue) / requiredValue) * 100;
  },

  /**
   * Расчёт поправки объёма для коррекции концентрации
   * Если добавлено слишком мало вещества, нужно добавить меньше стока (или больше буфера)
   * V_correction = V * (c_required / c_actual - 1)
   * Положительное значение = добавить буфера
   * Отрицательное значение = добавить меньше стока
   * 
   * @param requiredConcentration - требуемая концентрация
   * @param actualConcentration - фактическая концентрация
   * @returns поправка объёма в мл
   */
  calculateVolumeCorrection: (requiredConcentration, actualConcentration) => {
    if (actualConcentration === 0) return 0;
    // V_corr = V * (c_req / c_act - 1)
    // Но нам нужно вернуть относительную поправку
    const ratio = requiredConcentration / actualConcentration;
    return ratio - 1; // в виде множителя
  },
};

export { SUBSTANCES, DEFAULT_STOCK_CONCENTRATION, DEFAULT_FORMULAS, VOLUME_UNITS, MASS_UNITS };
