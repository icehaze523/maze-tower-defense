// Build Validation System
import { NodeState } from './Grid.js';
import { areAllSpawnsReachable, isPathAvailable } from './Pathfinding.js';

export class BuildValidator {
    constructor(grid) {
        this.grid = grid;
    }

    /**
     * Check if a tower can be placed at the given position
     * @param {number} x - Grid x coordinate
     * @param {number} y - Grid y coordinate
     * @param {Array} activeEnemies - Array of currently active enemies
     * @returns {Object} { valid: boolean, reason: string }
     */
    canPlaceTower(x, y, activeEnemies = []) {
        // Check if position is valid
        if (!this.grid.isValid(x, y)) {
            return { valid: false, reason: 'Position out of bounds' };
        }

        // Check if cell is empty
        if (this.grid.getState(x, y) !== NodeState.EMPTY) {
            return { valid: false, reason: 'Position is occupied' };
        }

        // Create temporary grid with tower placed
        const tempGrid = this.grid.clone();
        tempGrid.setState(x, y, NodeState.OCCUPIED);

        // Check if all spawn points can still reach the base
        if (!areAllSpawnsReachable(tempGrid)) {
            return { valid: false, reason: 'Would block path to base' };
        }

        // Check if any active enemies would be trapped
        for (const enemy of activeEnemies) {
            const enemyGridPos = this.grid.screenToGrid(enemy.x, enemy.y);
            if (!isPathAvailable(tempGrid, enemyGridPos)) {
                return { valid: false, reason: 'Would trap active enemies' };
            }
        }

        return { valid: true, reason: '' };
    }

    /**
     * Get visual feedback for placement preview
     * @param {number} x - Grid x coordinate
     * @param {number} y - Grid y coordinate
     * @param {Array} activeEnemies - Array of currently active enemies
     * @returns {string} 'valid', 'invalid', or 'occupied'
     */
    getPlacementFeedback(x, y, activeEnemies = []) {
        const result = this.canPlaceTower(x, y, activeEnemies);

        if (!this.grid.isValid(x, y)) return 'invalid';
        if (this.grid.getState(x, y) !== NodeState.EMPTY) return 'occupied';

        return result.valid ? 'valid' : 'invalid';
    }
}
