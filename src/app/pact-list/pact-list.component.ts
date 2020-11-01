import { Component, Input, OnInit } from '@angular/core';

import { pacts } from '../pacts';
import { randomize } from '../../randomizer';

@Component({
  selector: 'app-pact-list',
  templateUrl: './pact-list.component.html',
  styleUrls: ['./pact-list.component.scss']
})
export class PactListComponent implements OnInit {
  pacts = pacts;
  hellMode: boolean;
  targetHeat: number;

  constructor() { }


  ngOnInit(): void {
    this.targetHeat = 0;
  }

  increment(index) {
    let currentLevel = this.pacts[index].selectedLevel;
    currentLevel++;
    if (currentLevel <= this.pacts[index].levelValues.length) {
      this.pacts[index].selectedLevel = currentLevel;
    }
  }

  decrement([index]) {
    let currentLevel = this.pacts[index].selectedLevel;
    currentLevel--;
    if (currentLevel >= 0) {
      this.pacts[index].selectedLevel = currentLevel;
    }
  }

  hellModeToggled(hellMode) {
    if (hellMode) {
      this.pacts.forEach(condition => {
        if (this.isHellModeCondition(condition) && condition.selectedLevel < 1) {
          condition.selectedLevel = 1;
        }
      });
    } else {

      // Reset the "Hell Mode Only" condition to be level 0.
      this.pacts[15].selectedLevel = 0;
    }
  }

  isHellModeCondition(condition) {
    return condition.sortOrder == 1 // Hard Labor
        || condition.sortOrder == 2 // Lasting Consequences
        || condition.sortOrder == 4 // Jury Summons
        || condition.sortOrder == 6 // Calisthenics Program
        || condition.sortOrder == 16; // Personal Liability
  }

  randomize() {
    // The selected this.pacts are a subset, so we can should merge with the original and copy over levels to maintain the size of the list.
    this.pacts = randomize(this.pacts, this.targetHeat, this.hellMode);
  }

  lock(index) {
    this.pacts[index].locked = true;
  }

  unlock(index) {
    this.pacts[index].locked = false;
  }

  isMinIndex(condition) {
    // Special condition for mandatory hell mode conditions if hell mode is enabled.
    if (this.hellMode && this.isHellModeCondition(condition)) {
      return condition.selectedLevel <= 1;
    }
    return condition.selectedLevel <= 0;
  }

  isMaxIndex(condition) {
    return condition.selectedLevel >= condition.levelValues.length;
  }

  heatValue(condition) {
    return condition.selectedLevel == 0 ? 0 : condition.levelValues[condition.selectedLevel-1];
  }

  totalHeat() {
    let total = 0;
    this.pacts.forEach((condition) => {total += this.heatValue(condition);});
    return total;
  }
}
