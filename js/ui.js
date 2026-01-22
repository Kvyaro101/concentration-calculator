// ui.js - Управление интерфейсом и DOM

class UIManager {
  constructor(config) {
    this.config = config;
    this.substanceRows = new Map(); // Отслеживание добавленных веществ
    this.substanceCounter = 0; // Для генерации уникальных ID
  }

  /**
   * Инициализация UI - создание изначальной формы
   */
  init() {
    this.setupEventListeners();
    this.addSubstanceRow(); // Одно пустое поле по умолчанию
  }

  /**
   * Привязка обработчиков событий
   */
  setupEventListeners() {
    const btnAddSubstance = document.getElementById('btn-add-substance');
    const btnCalculateRequired = document.getElementById('btn-calculate-required');
    const btnCalculateActual = document.getElementById('btn-calculate-actual');
    const selectTab1 = document.getElementById('tab-select-1');
    const selectTab2 = document.getElementById('tab-select-2');

    if (btnAddSubstance) {
      btnAddSubstance.addEventListener('click', () => this.addSubstanceRow());
    }

    if (btnCalculateRequired) {
      btnCalculateRequired.addEventListener('click', () => {
        if (window.app) window.app.onCalculateStockRequirements();
      });
    }

    if (btnCalculateActual) {
      btnCalculateActual.addEventListener('click', () => {
        if (window.app) window.app.onCalculateActualResults();
      });
    }

    if (selectTab1) {
      selectTab1.addEventListener('change', (e) => this.switchTab(e.target.value));
    }

    if (selectTab2) {
      selectTab2.addEventListener('change', (e) => this.switchTab(e.target.value));
    }
  }

  /**
   * Переключение вкладок
   */
  switchTab(tabName) {
    const tabs = document.querySelectorAll('[data-tab]');
    tabs.forEach(tab => {
      tab.style.display = tab.dataset.tab === tabName ? 'block' : 'none';
    });
  }

  /**
   * Добавление строки для ввода вещества
   */
  addSubstanceRow() {
    const rowId = `substance-row-${++this.substanceCounter}`;
    const container = document.getElementById('substances-container');

    const row = document.createElement('div');
    row.className = 'substance-row';
    row.id = rowId;

    const substanceOptions = this.buildSubstanceOptions();

    row.innerHTML = `
      <div class="substance-group">
        <label>Вещество:</label>
        <select class="substance-select" data-substance-select="${rowId}" required>
          <option value="">-- Выбери вещество --</option>
          ${substanceOptions}
        </select>
        <button type="button" class="btn-remove" onclick="ui.removeSubstanceRow('${rowId}')">Удалить</button>
      </div>

      <div class="input-group">
        <label>Объём среды (мл):</label>
        <input type="number" class="volume-input" placeholder="1000" step="0.01" />
      </div>

      <div class="input-group">
        <label>Целевая концентрация (М):</label>
        <input type="number" class="concentration-input" placeholder="1.0" step="0.001" />
      </div>

      <div class="results-section">
        <div class="result-box required-result">
          <h4>Требуемая навеска:</h4>
          <p class="result-value">-</p>
          <small class="result-unit">г</small>
        </div>
      </div>

      <!-- Скрытая секция для ввода реальной массы (второй режим) -->
      <div class="actual-mass-section" style="display: none;">
        <label>Реально навешено (г):</label>
        <input type="number" class="actual-mass-input" placeholder="0.0000" step="0.0001" />
      </div>

      <!-- Результаты второго расчёта -->
      <div class="actual-results-section" style="display: none;">
        <div class="result-box actual-result">
          <h4>Реальная концентрация (М):</h4>
          <p class="result-value">-</p>
        </div>
        <div class="result-box error-result">
          <h4>Погрешность (%):</h4>
          <p class="result-value">-</p>
          <small class="result-status">-</small>
        </div>
        <div class="result-box correction-result">
          <h4>Рекомендуемая поправка:</h4>
          <p class="result-value">-</p>
          <small class="result-hint">-</small>
        </div>
      </div>
    `;

    container.appendChild(row);
    this.substanceRows.set(rowId, {
      volumeInput: row.querySelector('.volume-input'),
      concentrationInput: row.querySelector('.concentration-input'),
      substanceSelect: row.querySelector('.substance-select'),
      actualMassInput: row.querySelector('.actual-mass-input'),
      requiredResult: row.querySelector('.required-result p'),
      actualMassSection: row.querySelector('.actual-mass-section'),
      actualResultsSection: row.querySelector('.actual-results-section'),
      actualResultValue: row.querySelector('.actual-result p'),
      errorResultValue: row.querySelector('.error-result p'),
      errorStatus: row.querySelector('.error-result .result-status'),
      correctionValue: row.querySelector('.correction-result p'),
      correctionHint: row.querySelector('.correction-result .result-hint'),
    });
  }

  /**
   * Удаление строки вещества
   */
  removeSubstanceRow(rowId) {
    const row = document.getElementById(rowId);
    if (row) {
      row.remove();
      this.substanceRows.delete(rowId);
    }
  }

  /**
   * Построение опций для выбора веществ
   */
  buildSubstanceOptions() {
    return Object.values(this.config.SUBSTANCES)
      .map(
        substance =>
          `<option value="${substance.id}">${substance.name}</option>`
      )
      .join('');
  }

  /**
   * Получение данных из формы для расчёта требуемых масс
   * @returns {Array} массив объектов с параметрами
   */
  getRequiredMassInputs() {
    const inputs = [];

    this.substanceRows.forEach((row, rowId) => {
      const substanceId = row.substanceSelect.value;
      const volume = parseFloat(row.volumeInput.value);
      const concentration = parseFloat(row.concentrationInput.value);

      if (!substanceId || !volume || !concentration) {
        throw new Error(
          `Заполни все поля для вещества ${rowId}`
        );
      }

      const substance = this.config.SUBSTANCES[substanceId];
      if (!substance) {
        throw new Error(`Вещество не найдено: ${substanceId}`);
      }

      inputs.push({
        rowId,
        substanceId,
        substanceName: substance.name,
        volumeML: volume,
        targetConcentration: concentration,
        substanceMW: substance.mw,
      });
    });

    return inputs;
  }

  /**
   * Получение данных для расчёта реальных концентраций
   */
  getActualMassInputs() {
    const inputs = [];

    this.substanceRows.forEach((row, rowId) => {
      const substanceId = row.substanceSelect.value;
      const actualMass = parseFloat(row.actualMassInput.value);
      const volume = parseFloat(row.volumeInput.value);
      const targetConcentration = parseFloat(row.concentrationInput.value);

      if (!substanceId || !actualMass || !volume) {
        throw new Error(
          `Заполни поля для вещества ${rowId}`
        );
      }

      const substance = this.config.SUBSTANCES[substanceId];
      if (!substance) {
        throw new Error(`Вещество не найдено: ${substanceId}`);
      }

      inputs.push({
        rowId,
        substanceId,
        substanceName: substance.name,
        volumeML: volume,
        targetConcentration,
        actualMassG: actualMass,
        substanceMW: substance.mw,
      });
    });

    return inputs;
  }

  /**
   * Отобразить результаты требуемых масс
   */
  displayRequiredMassResults(results) {
    results.forEach(result => {
      if (result.error) {
        alert(`Ошибка: ${result.error}`);
        return;
      }

      const row = this.substanceRows.get(result.rowId);
      if (row) {
        row.requiredResult.textContent =
          `${result.result.formattedMass} г (${result.result.requiredMassMg} мг)`;
        
        // Показываем поле для ввода реальной массы
        row.actualMassSection.style.display = 'block';
      }
    });
  }

  /**
   * Отобразить результаты реальных концентраций
   */
  displayActualResults(results) {
    results.forEach(result => {
      if (result.error) {
        alert(`Ошибка: ${result.error}`);
        return;
      }

      const row = this.substanceRows.get(result.rowId);
      if (row) {
        const { actualConcentration, errorPercent, isAcceptable, recommendation } = result.result;

        row.actualResultValue.textContent = actualConcentration.toFixed(6);
        row.errorResultValue.textContent = errorPercent.toFixed(2) + '%';
        row.errorStatus.textContent = isAcceptable ? '✓ OK' : '✗ Вне допуска';
        row.errorStatus.className =
          isAcceptable ? 'result-status ok' : 'result-status error';

        row.correctionValue.textContent = recommendation;
        row.correctionHint.textContent = '(Или не добавляй вообще, если погрешка в допуске)';

        // Показываем результаты
        row.actualResultsSection.style.display = 'block';
      }
    });
  }

  /**
   * Очистить все результаты
   */
  clearResults() {
    this.substanceRows.forEach(row => {
      row.requiredResult.textContent = '-';
      row.actualMassSection.style.display = 'none';
      row.actualResultsSection.style.display = 'none';
    });
  }

  /**
   * Показать ошибку пользователю
   */
  showError(message) {
    alert(`❌ Ошибка: ${message}`);
  }

  /**
   * Показать успешное сообщение
   */
  showSuccess(message) {
    alert(`✓ ${message}`);
  }
}

// Export для использования
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIManager;
}