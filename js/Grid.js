// Grid and Map System
import { CONFIG } from './config.js';

export const NodeState = {
    EMPTY: 0,
    OCCUPIED: 1,
    BASE: 2
};

export class Grid {
    constructor(size = CONFIG.GRID_SIZE) {
        this.size = size;
        this.cells = Array(size).fill(null).map(() => Array(size).fill(NodeState.EMPTY));

        // Set base at center
        this.baseX = Math.floor(size / 2);
        this.baseY = Math.floor(size / 2);
        this.cells[this.baseY][this.baseX] = NodeState.BASE;

        // Generate edge spawn points
        this.spawnPoints = this.generateSpawnPoints();
    }

    generateSpawnPoints() {
        const points = [];
        const spacing = 4; // Spawn points every 4 cells

        // Top edge
        for (let x = 0; x < this.size; x += spacing) {
            points.push({ x, y: 0 });
        }

        // Bottom edge
        for (let x = 0; x < this.size; x += spacing) {
            points.push({ x, y: this.size - 1 });
        }

        // Left edge (skip corners)
        for (let y = spacing; y < this.size - spacing; y += spacing) {
            points.push({ x: 0, y });
        }

        // Right edge (skip corners)
        for (let y = spacing; y < this.size - spacing; y += spacing) {
            points.push({ x: this.size - 1, y });
        }

        return points;
    }

    isValid(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }

    getState(x, y) {
        if (!this.isValid(x, y)) return null;
        return this.cells[y][x];
    }

    setState(x, y, state) {
        if (!this.isValid(x, y)) return false;
        this.cells[y][x] = state;
        return true;
    }

    isWalkable(x, y) {
        const state = this.getState(x, y);
        return state === NodeState.EMPTY || state === NodeState.BASE;
    }

    clone() {
        const newGrid = new Grid(this.size);
        newGrid.cells = this.cells.map(row => [...row]);
        newGrid.baseX = this.baseX;
        newGrid.baseY = this.baseY;
        newGrid.spawnPoints = [...this.spawnPoints];
        return newGrid;
    }

    // Convert grid coordinates to screen coordinates
    gridToScreen(gridX, gridY) {
        return {
            x: gridX * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2,
            y: gridY * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2
        };
    }

    // Convert screen coordinates to grid coordinates
    screenToGrid(screenX, screenY) {
        return {
            x: Math.floor(screenX / CONFIG.CELL_SIZE),
            y: Math.floor(screenY / CONFIG.CELL_SIZE)
        };
    }

    getRandomSpawnPoint() {
        return this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)];
    }

    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -1 }, // up
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }  // left
        ];

        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (this.isValid(nx, ny)) {
                neighbors.push({ x: nx, y: ny, dx: dir.dx, dy: dir.dy });
            }
        }

        return neighbors;
    }
}
