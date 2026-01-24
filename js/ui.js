// js/ui.js

function createSubstanceUI(substances, container) {
    for (const key in substances) {
        const substance = substances[key];
        const substanceEl = document.createElement('div');
        substanceEl.classList.add('substance');
        substanceEl.id = `substance-${key}`;
        substanceEl.innerHTML = `
            <h3>${substance.name}</h3>
            <p>Required weight: <span id="required-weight-${key}">-</span> g</p>
            <div>
                <label for="actual-weight-${key}">Actual Weight (g):</label>
                <input type="number" id="actual-weight-${key}" class="actual-weight" step="any">
            </div>
        `;
        container.appendChild(substanceEl);
    }
}