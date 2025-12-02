// Economy System
import { CONFIG } from './config.js';

export class Economy {
    constructor() {
        this.gold = CONFIG.INITIAL_GOLD;
        this.totalEarned = 0;
        this.totalSpent = 0;
    }

    addGold(amount) {
        this.gold += amount;
        this.totalEarned += amount;
    }

    spendGold(amount) {
        if (this.gold >= amount) {
            this.gold -= amount;
            this.totalSpent += amount;
            return true;
        }
        return false;
    }

    canAfford(amount) {
        return this.gold >= amount;
    }

    getGold() {
        return this.gold;
    }

    onEnemyKilled(reward) {
        this.addGold(reward);
    }

    onWaveComplete(reward) {
        this.gold += reward;
    }
}
