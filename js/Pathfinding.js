// Flow Field Pathfinding System
import { NodeState } from './Grid.js';

export class FlowField {
    constructor(grid) {
        this.grid = grid;
        this.distanceField = null;
        this.flowField = null;
        this.calculate();
    }

    calculate() {
        const size = this.grid.size;

        // Initialize distance field with infinity
        this.distanceField = Array(size).fill(null).map(() => Array(size).fill(Infinity));
        this.flowField = Array(size).fill(null).map(() => Array(size).fill(null));

        // BFS from base outward
        const queue = [{ x: this.grid.baseX, y: this.grid.baseY, dist: 0 }];
        this.distanceField[this.grid.baseY][this.grid.baseX] = 0;

        while (queue.length > 0) {
            const current = queue.shift();
            const neighbors = this.grid.getNeighbors(current.x, current.y);

            for (const neighbor of neighbors) {
                const { x, y } = neighbor;

                // Skip if not walkable
                if (!this.grid.isWalkable(x, y)) continue;

                // Skip if already visited with shorter distance
                const newDist = current.dist + 1;
                if (this.distanceField[y][x] <= newDist) continue;

                this.distanceField[y][x] = newDist;
                queue.push({ x, y, dist: newDist });
            }
        }

        // Generate flow vectors
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (!this.grid.isWalkable(x, y)) continue;
                if (x === this.grid.baseX && y === this.grid.baseY) continue;

                // Find neighbor with smallest distance
                const neighbors = this.grid.getNeighbors(x, y);
                let bestNeighbor = null;
                let bestDist = Infinity;

                for (const neighbor of neighbors) {
                    const dist = this.distanceField[neighbor.y][neighbor.x];
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestNeighbor = neighbor;
                    }
                }

                if (bestNeighbor) {
                    this.flowField[y][x] = {
                        dx: bestNeighbor.dx,
                        dy: bestNeighbor.dy
                    };
                }
            }
        }
    }

    getDirection(x, y) {
        if (x < 0 || x >= this.grid.size || y < 0 || y >= this.grid.size) {
            return null;
        }
        return this.flowField[y][x];
    }

    getDistance(x, y) {
        if (x < 0 || x >= this.grid.size || y < 0 || y >= this.grid.size) {
            return Infinity;
        }
        return this.distanceField[y][x];
    }

    isReachable(x, y) {
        return this.getDistance(x, y) < Infinity;
    }
}

// Check if a path exists from startPoint to base
export function isPathAvailable(grid, startPoint) {
    const flowField = new FlowField(grid);
    return flowField.isReachable(startPoint.x, startPoint.y);
}

// Check if all spawn points can reach the base
export function areAllSpawnsReachable(grid) {
    const flowField = new FlowField(grid);

    for (const spawn of grid.spawnPoints) {
        if (!flowField.isReachable(spawn.x, spawn.y)) {
            return false;
        }
    }

    return true;
}

// Flying pathfinding - ignores tower obstacles
export class FlowFieldFlying {
    constructor(grid) {
        this.grid = grid;
        this.distanceField = null;
        this.flowField = null;
        this.calculate();
    }

    calculate() {
        const size = this.grid.size;

        // Initialize distance field with infinity
        this.distanceField = Array(size).fill(null).map(() => Array(size).fill(Infinity));
        this.flowField = Array(size).fill(null).map(() => Array(size).fill(null));

        // BFS from base outward
        const queue = [{ x: this.grid.baseX, y: this.grid.baseY, dist: 0 }];
        this.distanceField[this.grid.baseY][this.grid.baseX] = 0;

        while (queue.length > 0) {
            const current = queue.shift();
            const neighbors = this.grid.getNeighbors(current.x, current.y);

            for (const neighbor of neighbors) {
                const { x, y } = neighbor;

                // Flying enemies ignore occupied tiles - only check bounds
                if (x < 0 || x >= size || y < 0 || y >= size) continue;

                // Skip if already visited with shorter distance
                const newDist = current.dist + 1;
                if (this.distanceField[y][x] <= newDist) continue;

                this.distanceField[y][x] = newDist;
                queue.push({ x, y, dist: newDist });
            }
        }

        // Generate flow vectors
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (x === this.grid.baseX && y === this.grid.baseY) continue;

                // Find neighbor with smallest distance
                const neighbors = this.grid.getNeighbors(x, y);
                let bestNeighbor = null;
                let bestDist = Infinity;

                for (const neighbor of neighbors) {
                    const dist = this.distanceField[neighbor.y][neighbor.x];
                    if (dist < bestDist) {
                        bestDist = dist;
                        bestNeighbor = neighbor;
                    }
                }

                if (bestNeighbor) {
                    this.flowField[y][x] = {
                        dx: bestNeighbor.dx,
                        dy: bestNeighbor.dy
                    };
                }
            }
        }
    }

    getDirection(x, y) {
        if (x < 0 || x >= this.grid.size || y < 0 || y >= this.grid.size) {
            return null;
        }
        return this.flowField[y][x];
    }

    getDistance(x, y) {
        if (x < 0 || x >= this.grid.size || y < 0 || y >= this.grid.size) {
            return Infinity;
        }
        return this.distanceField[y][x];
    }

    isReachable(x, y) {
        return this.getDistance(x, y) < Infinity;
    }
}
