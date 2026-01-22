// app.js - Главный контроллер (координация слоёв)

class App {
  constructor() {
    this.calculator = new ConcentrationCalculator(DEFAULT_FORMULAS);
    this.uiManager = new UIManager({
      SUBSTANCES: SUBSTANCES,
    });
  }

  /**
   * Инициализация приложения
   */
  init() {
    console.log('🧪 Приложение запущено');
    this.uiManager.init();
    window.app = this; // Для доступа из HTML
  }

  /**
   * Обработчик кнопки "Рассчитать требуемые массы"
   */
  onCalculateStockRequirements() {
    try {
      // 1. Получить входные данные из формы
      const inputs = this.uiManager.getRequiredMassInputs();

      // 2. Выполнить расчёты
      const results = this.calculator.calculateBatch(inputs);

      // 3. Отобразить результаты
      this.uiManager.displayRequiredMassResults(results);

      console.log('✓ Расчёт требуемых масс завершён:', results);
    } catch (error) {
      console.error('❌ Ошибка при расчёте:', error);
      this.uiManager.showError(error.message);
    }
  }

  /**
   * Обработчик кнопки "Рассчитать коррекцию"
   */
  onCalculateCorrection(substanceId) {
    try {
        // 1. Получить входные данные из формы
        const inputs = this.uiManager.getActualMassInputs(substanceId);

        // 2. Выполнить расчёты
        const results = this.calculator.calculateCompleteResults(inputs);

        // 3. Отобразить результаты
        this.uiManager.displayCorrectionResults(substanceId, results);

        console.log('✓ Расчёт коррекции завершён:', results);
    } catch (error) {
        console.error('❌ Ошибка при расчёте коррекции:', error);
        this.uiManager.showError(error.message);
    }
  }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});