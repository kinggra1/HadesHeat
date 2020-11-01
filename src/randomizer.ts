var DECISION_CACHE = new Array(65).fill(-1).map(() => new Array(17).fill(-1));

/**
 * Shuffles array in place.
 * @param {Array} a items An array containing the items.
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

function generateHeatCombination(allPacts, n, sum, hellModeEnabled) {
    let randomizedPacts = shuffle([...allPacts]);

    let selectedPacts = []; 
    // Decision Cache is a boolean matrix of size [sum+1][n+1] 
    // let decisionCache = new Array(sum+1).fill(-1).map(() => new Array(n+1).fill(-1));
    if (validHeatSubset(randomizedPacts, n, sum, DECISION_CACHE, selectedPacts, hellModeEnabled)) {
        selectedPacts.sort(function(a, b) {return a.sortOrder - b.sortOrder;});
        return selectedPacts;
    }

    alert("Unable to reach Target Heat value with the currently locked Conditions.");
    return [];
}

function validHeatSubset(PactsList, n, remainingSum, DECISION_CACHE, selectedPacts, hellModeEnabled) {
    // If the decision cache is set, return the existing value.
    if (DECISION_CACHE[remainingSum][n] != -1) {
        return DECISION_CACHE[remainingSum][n];
    }

    // We have reached the approprate sum prior to this call, we did it!
    if (remainingSum == 0) {
        DECISION_CACHE[remainingSum][n] = true;
        return true;
    }
    // Nothing left to select from.
    if (n == 0) {
        DECISION_CACHE[remainingSum][n] = false;
        return false;
    }

    let nextPact = PactsList[n-1];
    let numLevels = nextPact.levelValues.length;
    // Create a randomized list of level indices so we do not preferentially try to min/max different Pacts.
    let randomizedLevels = shuffle(Array(numLevels).fill(-1).map((_, i) => i));
    // Adjusted cost of skipping a Hell Mode Condition, because we will actually always be selecting level 1 at minimum.
    let hellModeConditionSkipCost = (hellModeEnabled && isHellModeCondition(nextPact)) ? 1 : 0;
    
    // Iterate through the possible level heat values of the next Pact for recursion.
    for (let i = 0; i < numLevels; i++) {

        let level = randomizedLevels[i];

        let levelValuesIndex = level;
        // If we are in hell mode, find cost by pretending we're one level higher than we actually are
        // and if we are currently selecting the max level, skip.
        if (hellModeEnabled && isHellModeCondition(nextPact)) {
            levelValuesIndex += 1;
            if (levelValuesIndex >= nextPact.levelValues.length) {
                console.log(nextPact.name + " " + levelValuesIndex)
                continue;
            }
        }

        let value = nextPact.levelValues[levelValuesIndex];
        
        
        // If we cannot possible include this Pact at this level, skip it.
        if (value > remainingSum) {
            if (validHeatSubset(PactsList, n-1, remainingSum - hellModeConditionSkipCost, DECISION_CACHE, selectedPacts, hellModeEnabled)) {
                DECISION_CACHE[remainingSum][n] = true;
                return true;
            } else {
                continue;
            }
        }

        // Then try both including this level of the current Pact.
        // If we included this Pact when the subroutine finds a solution, add it in the result with level set.
        if (validHeatSubset(PactsList, n-1, remainingSum-value, DECISION_CACHE, selectedPacts, hellModeEnabled)) {
            nextPact.selectedLevel = level+1;
            selectedPacts.push(nextPact);
            return true;
        }
    }

    // If we can't make this Pact work with any level, skip it.
    let result = validHeatSubset(PactsList, n-1, remainingSum - hellModeConditionSkipCost, DECISION_CACHE, selectedPacts, hellModeEnabled);
    DECISION_CACHE[remainingSum][n] = result;
    return result;
}

function isHellModeCondition(condition) {
    return condition.sortOrder == 1 // Hard Labor
        || condition.sortOrder == 2 // Lasting Consequences
        || condition.sortOrder == 4 // Jury Summons
        || condition.sortOrder == 6 // Calisthenics Program
        || condition.sortOrder == 16; // Personal Liability
  }

  function removeHellModeLevels(allConditions) {
    allConditions.forEach(condition => {
        if (isHellModeCondition(condition)) {
            condition.selectedLevel -= 1;
            // Just in case we forgot to update the selected level on this condition outside of this file
            if (condition.selectedLevel < 0) {
                condition.selectedLevel = 0;
            }
        }
    });
  }
  
  function addHellModeLevels(allConditions) {
    allConditions.forEach(condition => {
        if (isHellModeCondition(condition)) {
            condition.selectedLevel += 1;
        }
    });
  }


// var TARGET_SUM = 63;

export function randomize(allPacts, targetHeat, hellModeEnabled) {

    let currentConditions = [...allPacts];

    // Reset the DECISION_CACHE for recursive caching.
    DECISION_CACHE.forEach(array => {
        array.fill(-1);
    })

    let modifiedTargetHeat = targetHeat;
    // Temporarily reset the pacts need to be incremented to account for Hell Mode
    // and subtract their total from our target heat. Basically this allows us to project our
    // condition matrix out of hell mode, find a randomized heat total, and project back to hell mode.
    if (hellModeEnabled) {
        removeHellModeLevels(currentConditions);
        modifiedTargetHeat -= 5;
    }

    // Make a view of the pacts that we can actually modify (those that are not locked)
    // and subtract the value of the locked 
    let unlockedPacts = [];
    currentConditions.forEach(pact => {
        if (pact.locked) {
            modifiedTargetHeat -= pact.selectedLevel == 0 ? 0 : pact.levelValues[pact.selectedLevel - 1];
        } else if (hellModeEnabled || pact.sortOrder != 16) {
            // Push copies to maintain the current state of currentConditions
            unlockedPacts.push({...pact});
        }
    });

    if (modifiedTargetHeat < 0) {
        alert("Currently locked Conditions exceed Target Heat value.");
        if (hellModeEnabled) {
            addHellModeLevels(currentConditions);
        }
        return currentConditions;
    }

    // Clear the selected levels of the target list of pacts.
    unlockedPacts.forEach(pact => { pact.selectedLevel = 0; });
    let result = generateHeatCombination(unlockedPacts, unlockedPacts.length, targetHeat, hellModeEnabled);

    // Case where we were unable to find a valid combination, return the input list.
    if (result.length == 0 && targetHeat != 0) {
        return currentConditions;
    }

    // result.sort(function(a, b) {return a.sortOrder - b.sortOrder;});

    // If we have a valid result returned, we should zero out and reset conditions to match the result
    currentConditions.forEach((condition) => {condition.selectedLevel = 0});
    result.forEach((resultCondition) => {
        currentConditions[resultCondition.sortOrder-1].selectedLevel = resultCondition.selectedLevel;
    })
    
    // Reproject our selection back to "Hell Mode" space if it is enabled.
    if (hellModeEnabled) {
        addHellModeLevels(currentConditions);
    }

    return currentConditions;
}