// js/app.js

document.addEventListener('DOMContentLoaded', () => {
    const substancesContainer = document.getElementById('substances');
    const volumeInput = document.getElementById('volume');
    const calculateInitialBtn = document.getElementById('calculate-initial');
    const calculateCorrectionBtn = document.getElementById('calculate-correction');
    const resultsContainer = document.getElementById('results');
    const resultDetailsContainer = document.getElementById('result-details');

    // Dynamically create substance sections using the function from ui.js
    createSubstanceUI(substances, substancesContainer);

    calculateInitialBtn.addEventListener('click', () => {
        const volume_ml = parseFloat(volumeInput.value);
        if (isNaN(volume_ml) || volume_ml <= 0) {
            alert('Please enter a valid volume.');
            return;
        }

        for (const key in substances) {
            const substance = substances[key];
            const requiredWeight = calculateRequiredWeight(substance, volume_ml);
            document.getElementById(`required-weight-${key}`).textContent = requiredWeight.toFixed(8);
        }

        calculateCorrectionBtn.classList.remove('hidden');
    });

    calculateCorrectionBtn.addEventListener('click', () => {
        const volume_ml = parseFloat(volumeInput.value);
        if (isNaN(volume_ml) || volume_ml <= 0) {
            alert('Please enter a valid volume.');
            return;
        }

        resultDetailsContainer.innerHTML = ''; // Clear previous results

        for (const key in substances) {
            const substance = substances[key];
            const actualWeightInput = document.getElementById(`actual-weight-${key}`);
            const actual_weight_g = parseFloat(actualWeightInput.value);

            if (isNaN(actual_weight_g) || actual_weight_g < 0) {
                alert(`Please enter a valid actual weight for ${substance.name}.`);
                continue;
            }

            const correction = calculateCorrection(substance, actual_weight_g, volume_ml);

            const resultEl = document.createElement('div');
            resultEl.innerHTML = `
                <h4>${substance.name}</h4>
                <p>Actual Concentration: ${correction.actual_concentration.toFixed(8)} mol/L</p>
                <p>Correction: ${correction.message}</p>
            `;
            resultDetailsContainer.appendChild(resultEl);
        }

        resultsContainer.classList.remove('hidden');
    });
});
