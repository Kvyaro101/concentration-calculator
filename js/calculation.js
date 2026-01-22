// js/calculation.js

/**
 * Calculates the required weight of a substance to achieve a target concentration in a given volume.
 * @param {object} substance - The substance object from config.js.
 * @param {number} volume_ml - The target volume in milliliters.
 * @returns {number} The required weight in grams.
 */
function calculateRequiredWeight(substance, volume_ml) {
    const volume_l = volume_ml / 1000;
    const moles = substance.targetConcentration * volume_l;
    const weight_g = moles * substance.molarMass;
    return weight_g;
}

/**
 * Calculates the actual concentration and the required correction.
 * @param {object} substance - The substance object from config.js.
 * @param {number} actual_weight_g - The actual weight measured by the user in grams.
 * @param {number} volume_ml - The target volume in milliliters.
 * @returns {object} An object containing the actual concentration and the correction volume.
 */
function calculateCorrection(substance, actual_weight_g, volume_ml) {
    const volume_l = volume_ml / 1000;
    const actual_moles = actual_weight_g / substance.molarMass;
    const actual_concentration = actual_moles / volume_l;

    const moles_needed = (substance.targetConcentration - actual_concentration) * volume_l;

    let correction = {
        actual_concentration: actual_concentration,
        correction_volume_ml: 0,
        correction_needed: false,
        message: ""
    };

    if (moles_needed > 0) {
        // Concentration is too low, need to add more stock solution
        const volume_of_stock_to_add_l = moles_needed / substance.stockConcentration;
        correction.correction_volume_ml = volume_of_stock_to_add_l * 1000;
        correction.correction_needed = true;
        correction.message = `Add ${correction.correction_volume_ml.toFixed(6)} ml of stock solution.`;

    } else if (moles_needed < 0) {
        // Concentration is too high
        correction.correction_needed = true;
        //This case is tricky. "add less stock" is not an action.
        //Let's calculate how much more solvent is needed to dilute to target concentration.
        const new_volume_l = actual_moles / substance.targetConcentration;
        const solvent_to_add_ml = (new_volume_l - volume_l) * 1000;
        correction.message = `Concentration is too high. Add ${solvent_to_add_ml.toFixed(4)} ml of solvent to reach the target concentration (total volume will be ${(volume_l * 1000 + solvent_to_add_ml).toFixed(4)} ml).`;
    } else {
        // Concentration is correct
        correction.message = "Concentration is correct.";
    }

    return correction;
}