// config.js - Конфигурация веществ и параметры

const SUBSTANCES = {
  'all-trans-retinal': {
    id: 'all-trans-retinal',
    name: 'all-trans-retinal',
    mw: 284.44,
    stockConcentration: 5e-3, // 5*10^-3 mol/liter
    targetConcentration: 5e-6, // 5*10^-6 mol/liter
  },
  iptg: {
    id: 'iptg',
    name: 'IPTG',
    mw: 238.3,
    stockConcentration: 1, // 1 mol/liter
    targetConcentration: 5e-4, // 5*10^-4 mol/liter
  },
};
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
  calculateVolumeCorrection: (requiredConcentration, actualConcentration, volumeML) => {
    if (actualConcentration === 0) return 0;
    return volumeML * (actualConcentration / requiredConcentration - 1);
  },
};


