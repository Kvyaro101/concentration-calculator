// calculation.js - Ядро расчётов (чистые функции)

class ConcentrationCalculator {
  /**
   * @param {Object} formulas - объект с функциями расчётов
   * Можно переопределить формулы при создании экземпляра
   */
  constructor(formulas = null) {
    // Импортируем default формулы если не передали custom
    this.formulas = formulas || DEFAULT_FORMULAS;
  }

  /**
   * Расчёт требуемой навески для стокового раствора
   * @param {Object} params
   *   - volumeML: объём среды в мл
   *   - targetConcentration: целевая концентрация в М
   *   - substanceMW: молярная масса вещества в г/моль
   * @returns {Object} { requiredMassG, formattedMass }
   */
  calculateRequiredMass(params) {
    const { volumeML, targetConcentration, substanceMW } = params;

    if (!volumeML || !targetConcentration || !substanceMW) {
      throw new Error('Не все параметры заполнены');
    }

    const massG = this.formulas.calculateRequiredMass(
      volumeML,
      targetConcentration,
      substanceMW
    );

    return {
      requiredMassG: massG,
      formattedMass: massG.toFixed(4),
      requiredMassMg: (massG * 1000).toFixed(2),
    };
  }

  /**
   * Расчёт реальной концентрации по внесённой массе
   * @param {Object} params
   *   - actualMassG: фактически внесённая масса в г
   *   - volumeML: объём среды в мл
   *   - substanceMW: молярная масса вещества в г/моль
   * @returns {Object} { actualConcentrationM, formattedConcentration }
   */
  calculateActualConcentration(params) {
    const { actualMassG, volumeML, substanceMW } = params;

    if (!actualMassG || !volumeML || !substanceMW) {
      throw new Error('Не все параметры заполнены');
    }

    const concM = this.formulas.calculateActualConcentration(
      actualMassG,
      volumeML,
      substanceMW
    );

    return {
      actualConcentrationM: concM,
      formattedConcentration: concM.toFixed(6),
    };
  }

  /**
   * Расчёт погрешности в процентах
   * @param {number} requiredValue - требуемое значение
   * @param {number} actualValue - фактическое значение
   * @returns {Object} { errorPercent, formattedError, isAcceptable }
   */
  calculateErrorPercent(requiredValue, actualValue, acceptableErrorPercent = 10) {
    const errorPercent = this.formulas.calculateErrorPercent(
      requiredValue,
      actualValue
    );

    const isAcceptable = Math.abs(errorPercent) <= acceptableErrorPercent;

    return {
      errorPercent,
      formattedError: errorPercent.toFixed(2),
      isAcceptable,
      acceptableRange: acceptableErrorPercent,
    };
  }

  /**
   * Полный расчёт реальных результатов
   * Включает концентрацию, погрешность и рекомендацию по поправке
   */
  calculateCompleteResults(params) {
    const {
      requiredConcentration,
      actualMassG,
      volumeML,
      substanceMW,
      acceptableErrorPercent = 10,
    } = params;

    // Реальная концентрация
    const actualResult = this.calculateActualConcentration({
      actualMassG,
      volumeML,
      substanceMW,
    });

    // Погрешность
    const errorResult = this.calculateErrorPercent(
      requiredConcentration,
      actualResult.actualConcentrationM,
      acceptableErrorPercent
    );

    // Поправка объёма
    const volumeCorrectionFactor =
      this.formulas.calculateVolumeCorrection(
        requiredConcentration,
        actualResult.actualConcentrationM
      );

    return {
      actualConcentration: actualResult.actualConcentrationM,
      formattedConcentration: actualResult.formattedConcentration,
      errorPercent: errorResult.errorPercent,
      formattedError: errorResult.formattedError,
      isAcceptable: errorResult.isAcceptable,
      volumeCorrectionFactor,
      // Если нужно добавить V миллилитров буфера (если фактор положительный)
      volumeCorrectionML: volumeCorrectionFactor * volumeML,
      recommendation:
        volumeCorrectionFactor > 0
          ? `Добавить ≈ ${Math.abs((volumeCorrectionFactor * volumeML).toFixed(2))} мл буфера`
          : `Добавить на ${Math.abs((volumeCorrectionFactor * 100).toFixed(1))}% меньше стока`,
    };
  }

  /**
   * Расчёт для нескольких веществ одновременно
   * @param {Array} substancesParams - массив объектов параметров
   * @returns {Array} массив результатов
   */
  calculateBatch(substancesParams) {
    return substancesParams.map(params => {
      try {
        return {
          ...params,
          result: this.calculateRequiredMass(params),
          error: null,
        };
      } catch (err) {
        return {
          ...params,
          result: null,
          error: err.message,
        };
      }
    });
  }
}

// Export для использования в других модулях
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ConcentrationCalculator;
}