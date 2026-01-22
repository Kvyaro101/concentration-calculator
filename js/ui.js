// ui.js - Управление интерфейсом и DOM

class UIManager {
  constructor(config) {
    this.config = config;
    this.substanceRows = new Map(); // Отслеживание добавленных веществ
  }

  /**
   * Инициализация UI - создание изначальной формы
   */
  init() {
    this.renderSubstances();
    this.setupEventListeners();
  }

  /**
   * Привязка обработчиков событий
   */
  setupEventListeners() {
    const btnCalculateRequired = document.getElementById('btn-calculate-required');
    if (btnCalculateRequired) {
      btnCalculateRequired.addEventListener('click', () => {
        if (window.app) window.app.onCalculateStockRequirements();
      });
    }

    this.substanceRows.forEach((row, substanceId) => {
        const btnCalculateCorrection = document.getElementById(`btn-calculate-correction-${substanceId}`);
        if (btnCalculateCorrection) {
            btnCalculateCorrection.addEventListener('click', () => {
                if (window.app) window.app.onCalculateCorrection(substanceId);
            });
        }
    });
  }

  /**
   * Рендеринг всех веществ из конфига
   */
  renderSubstances() {
    const container = document.getElementById('substances-container');
    container.innerHTML = ''; // Очищаем контейнер

    Object.values(this.config.SUBSTANCES).forEach(substance => {
      const rowId = `substance-row-${substance.id}`;
      const row = document.createElement('div');
      row.className = 'substance-row';
      row.id = rowId;

      row.innerHTML = `
        <div class="substance-group">
          <label>Вещество:</label>
          <span class="substance-name">${substance.name}</span>
        </div>

        <div class="results-section">
          <div class="result-box required-result">
            <h4>Требуемая навеска:</h4>
            <p class="result-value" id="required-mass-${substance.id}">-</p>
            <small class="result-unit">г</small>
          </div>
        </div>

        <div class="actual-mass-section">
            <label for="actual-mass-${substance.id}">Реальная навеска (г):</label>
            <input type="number" id="actual-mass-${substance.id}" class="actual-mass-input" placeholder="0.0" step="0.0001">
            <button class="btn btn-secondary" id="btn-calculate-correction-${substance.id}">Рассчитать коррекцию</button>
        </div>
        
        <div class="results-section">
            <div class="result-box actual-result">
                <h4>Реальная концентрация:</h4>
                <p class="result-value" id="actual-concentration-${substance.id}">-</p>
                <small class="result-unit">М</small>
            </div>
            <div class="result-box error-result">
                <h4>Погрешность:</h4>
                <p class="result-value" id="error-${substance.id}">-</p>
                <small class="result-unit">%</small>
            </div>
            <div class="result-box correction-result">
                <h4>Коррекция:</h4>
                <p class="result-value" id="correction-${substance.id}">-</p>
            </div>
        </div>
      `;

      container.appendChild(row);
      this.substanceRows.set(substance.id, {
        rowId: rowId,
        requiredResult: row.querySelector(`#required-mass-${substance.id}`),
        actualMassInput: row.querySelector(`#actual-mass-${substance.id}`),
        actualConcentration: row.querySelector(`#actual-concentration-${substance.id}`),
        error: row.querySelector(`#error-${substance.id}`),
        correction: row.querySelector(`#correction-${substance.id}`),
      });
    });
  }

  /**
   * Получение данных из формы для расчёта требуемых масс
   * @returns {Array} массив объектов с параметрами
   */
  getRequiredMassInputs() {
    const inputs = [];
    const volume = parseFloat(document.getElementById('volume-input').value);

    if (!volume || volume <= 0) {
      throw new Error('Заполните поле "Объём среды" положительным значением');
    }

    this.substanceRows.forEach((row, substanceId) => {
      const substance = this.config.SUBSTANCES[substanceId];
      if (!substance) {
        throw new Error(`Вещество не найдено: ${substanceId}`);
      }

      inputs.push({
        rowId: substance.id,
        substanceId,
        substanceName: substance.name,
        volumeML: volume,
        targetConcentration: substance.targetConcentration,
        substanceMW: substance.mw,
      });
    });

    return inputs;
  }

    /**
   * Получение данных из формы для расчёта коррекции
   */
    getActualMassInputs(substanceId) {
        const volume = parseFloat(document.getElementById('volume-input').value);
        if (!volume || volume <= 0) {
            throw new Error('Заполните поле "Объём среды" положительным значением');
        }

        const substance = this.config.SUBSTANCES[substanceId];
        if (!substance) {
            throw new Error(`Вещество не найдено: ${substanceId}`);
        }

        const row = this.substanceRows.get(substanceId);
        const actualMassG = parseFloat(row.actualMassInput.value);

        if (isNaN(actualMassG) || actualMassG < 0) {
            throw new Error(`Введите корректное значение реальной навески для ${substance.name}`);
        }

        return {
            substanceId,
            volumeML: volume,
            actualMassG,
            substanceMW: substance.mw,
            requiredConcentration: substance.targetConcentration,
        };
    }

  /**
   * Отобразить результаты требуемых масс
   */
  displayRequiredMassResults(results) {
    results.forEach(result => {
      if (result.error) {
        this.showError(result.error);
        return;
      }
      const row = this.substanceRows.get(result.substanceId);
      if (row) {
        row.requiredResult.textContent = `${result.result.formattedMass}`;
      }
    });
  }

    /**
     * Отобразить результаты коррекции
     */
    displayCorrectionResults(substanceId, results) {
        if (results.error) {
            this.showError(results.error);
            return;
        }

        const row = this.substanceRows.get(substanceId);
        if (row) {
            row.actualConcentration.textContent = results.formattedConcentration;
            row.error.textContent = results.formattedError;
            row.correction.textContent = results.recommendation;
        }
    }

  /**
   * Показать ошибку пользователю
   */
  showError(message) {
    alert(`❌ Ошибка: ${message}`);
  }
}
