// app.js - Главный контроллер (координация слоёв)

class App {
  constructor() {
    this.calculator = new ConcentrationCalculator(DEFAULT_FORMULAS);
    this.uiManager = new UIManager({
      SUBSTANCES: SUBSTANCES,
    });
    this.currentResults = []; // Для сохранения результатов между расчётами
  }

  /**
   * Инициализация приложения
   */
  init() {
    console.log('🧪 Приложение запущено');
    this.uiManager.init();
    window.app = this; // Для доступа из HTML
    window.ui = this.uiManager; // Для доступа из HTML
  }

  /**
   * Обработчик кнопки "Рассчитать требуемые массы"
   */
  onCalculateStockRequirements() {
    try {
      // 1. Получить входные данные из формы
      const inputs = this.uiManager.getRequiredMassInputs();

      // 2. Выполнить расчёты
      const results = inputs.map(input => {
        const requiredMassResult = this.calculator.calculateRequiredMass({
          volumeML: input.volumeML,
          targetConcentration: input.targetConcentration,
          substanceMW: input.substanceMW,
        });

        return {
          rowId: input.rowId,
          substanceId: input.substanceId,
          substanceName: input.substanceName,
          volumeML: input.volumeML,
          targetConcentration: input.targetConcentration,
          substanceMW: input.substanceMW,
          result: requiredMassResult,
          error: null,
        };
      });

      // 3. Сохранить для второго расчёта
      this.currentResults = results;

      // 4. Отобразить результаты
      this.uiManager.displayRequiredMassResults(results);

      console.log('✓ Расчёт требуемых масс завершён:', results);
    } catch (error) {
      console.error('❌ Ошибка при расчёте:', error);
      this.uiManager.showError(error.message);
    }
  }

  /**
   * Обработчик кнопки "Рассчитать реальные концентрации"
   */
  onCalculateActualResults() {
    try {
      // 1. Получить входные данные
      const inputs = this.uiManager.getActualMassInputs();

      // 2. Выполнить расчёты
      const results = inputs.map(input => {
        const completeResult = this.calculator.calculateCompleteResults({
          requiredConcentration: input.targetConcentration,
          actualMassG: input.actualMassG,
          volumeML: input.volumeML,
          substanceMW: input.substanceMW,
          acceptableErrorPercent: 10, // Допуск ±10%
        });

        return {
          rowId: input.rowId,
          substanceId: input.substanceId,
          substanceName: input.substanceName,
          result: completeResult,
          error: null,
        };
      });

      // 3. Отобразить результаты
      this.uiManager.displayActualResults(results);

      console.log('✓ Расчёт реальных концентраций завершён:', results);
    } catch (error) {
      console.error('❌ Ошибка при расчёте:', error);
      this.uiManager.showError(error.message);
    }
  }

  /**
   * Экспортировать результаты (JSON)
   */
  exportResults() {
    if (this.currentResults.length === 0) {
      this.uiManager.showError('Нет результатов для экспорта');
      return;
    }

    const exportData = {
      timestamp: new Date().toISOString(),
      results: this.currentResults,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `calculator-results-${Date.now()}.json`;
    link.click();

    URL.revokeObjectURL(url);
  }

  /**
   * Переопределить формулы расчётов
   * Пример использования для специальных случаев:
   * app.setCustomFormulas(myCustomFormulas);
   */
  setCustomFormulas(customFormulas) {
    this.calculator = new ConcentrationCalculator(customFormulas);
    console.log('✓ Формулы переопределены');
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});