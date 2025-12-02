// Main Game Engine
import { CONFIG, WAVE_CONFIG, TOWER_TYPES } from './config.js';
import { Grid, NodeState } from './Grid.js';
import { FlowField, FlowFieldFlying } from './Pathfinding.js';
import { BuildValidator } from './BuildValidator.js';
import { Tower } from './Tower.js';
import { WaveManager } from './WaveManager.js';
import { Economy } from './Economy.js';
import { Renderer } from './Renderer.js';
import { UI } from './UI.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
        this.canvas.height = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;

        // Core systems
        this.grid = new Grid();
        this.flowField = new FlowField(this.grid);
        this.flowFieldFlying = new FlowFieldFlying(this.grid); // For flying enemies
        this.buildValidator = new BuildValidator(this.grid);
        this.waveManager = new WaveManager(this.grid);
        this.economy = new Economy();
        this.renderer = new Renderer(canvas);
        this.ui = new UI(this);

        // Game state
        this.lives = CONFIG.INITIAL_LIVES;
        this.maxWaves = WAVE_CONFIG.length;
        this.gameOver = false;
        this.victory = false;
        this.demolishMode = false;

        // Entities
        this.towers = [];
        this.enemies = [];

        // Mouse state
        this.mouseGridX = null;
        this.mouseGridY = null;
        this.hoveredTower = null;

        // Game loop
        this.lastTime = Date.now();
        this.setupEventListeners();
        this.start();
    }

    setupEventListeners() {
        // Mouse move
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const gridPos = this.grid.screenToGrid(x, y);
            this.mouseGridX = gridPos.x;
            this.mouseGridY = gridPos.y;

            // Check if hovering over a tower
            this.hoveredTower = null;
            for (const tower of this.towers) {
                if (tower.gridX === gridPos.x && tower.gridY === gridPos.y) {
                    this.hoveredTower = tower;
                    break;
                }
            }
        });

        // Mouse click
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver || this.victory) return;

            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const gridPos = this.grid.screenToGrid(x, y);

            if (this.demolishMode) {
                this.demolishTower(gridPos.x, gridPos.y);
            } else {
                this.placeTower(gridPos.x, gridPos.y);
            }
        });

        // Restart buttons
        document.getElementById('restart-btn').addEventListener('click', () => {
            location.reload();
        });

        document.getElementById('restart-btn-victory').addEventListener('click', () => {
            location.reload();
        });
    }

    placeTower(gridX, gridY) {
        if (!this.ui.selectedTowerType) return;

        const towerConfig = TOWER_TYPES[this.ui.selectedTowerType];

        // Check if can afford
        if (!this.economy.canAfford(towerConfig.cost)) {
            this.ui.showMessage('Not enough gold!', 'error');
            return;
        }

        // Validate placement
        const validation = this.buildValidator.canPlaceTower(gridX, gridY, this.enemies);

        if (!validation.valid) {
            this.ui.showMessage(validation.reason, 'error');
            return;
        }

        // Place tower
        this.economy.spendGold(towerConfig.cost);
        this.grid.setState(gridX, gridY, NodeState.OCCUPIED);

        const tower = new Tower(gridX, gridY, this.ui.selectedTowerType);
        this.towers.push(tower);

        // Recalculate flow fields
        this.flowField = new FlowField(this.grid);
        this.flowFieldFlying = new FlowFieldFlying(this.grid);

        this.ui.showMessage(`${towerConfig.name} placed!`, 'success', 1000);
    }

    demolishTower(gridX, gridY) {
        // Find tower at this position
        const towerIndex = this.towers.findIndex(t => t.gridX === gridX && t.gridY === gridY);

        if (towerIndex === -1) {
            this.ui.showMessage('No tower here!', 'error');
            return;
        }

        const tower = this.towers[towerIndex];

        // Calculate 60% refund
        const refund = Math.floor(tower.totalInvestment * 0.6);
        this.economy.addGold(refund);

        // Remove tower
        this.towers.splice(towerIndex, 1);
        this.grid.setState(gridX, gridY, NodeState.EMPTY);

        // Recalculate flow fields
        this.flowField = new FlowField(this.grid);
        this.flowFieldFlying = new FlowFieldFlying(this.grid);

        this.ui.showMessage(`Tower demolished! +${refund} gold`, 'success', 1000);
    }

    upgradeTower(tower) {
        if (!tower.canUpgrade()) {
            this.ui.showMessage('Tower at max level!', 'error');
            return false;
        }

        const cost = tower.getUpgradeCost();

        if (!this.economy.canAfford(cost)) {
            this.ui.showMessage('Not enough gold!', 'error');
            return false;
        }

        this.economy.spendGold(cost);
        tower.upgrade();

        this.ui.showMessage(`Tower upgraded to level ${tower.level}!`, 'success', 1000);
        return true;
    }

    toggleDemolishMode() {
        this.demolishMode = !this.demolishMode;
        this.ui.selectedTowerType = null; // Clear tower selection when entering demolish mode
    }

    startWave() {
        if (this.waveManager.isWaveActive()) return;

        const result = this.waveManager.startNextWave();

        if (result.victory) {
            this.victory = true;
            this.ui.showVictory();
            return;
        }

        this.ui.showMessage(`Wave ${result.wave} started!`, 'info', 2000);
    }

    toggleHeatmap() {
        this.renderer.toggleHeatmap();
    }

    update() {
        const currentTime = Date.now();
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        if (this.gameOver || this.victory) return;

        // Update wave manager and spawn enemies
        const newEnemies = this.waveManager.update(this.enemies);
        this.enemies.push(...newEnemies);

        // Update enemies
        for (const enemy of this.enemies) {
            // Use flying pathfinding for flying enemies
            const pathfinder = enemy.isFlying ? this.flowFieldFlying : this.flowField;
            enemy.update(deltaTime, pathfinder, this.grid);
        }

        // Check for enemies reaching base
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (enemy.reachedBase) {
                this.lives--;
                this.enemies.splice(i, 1);

                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.ui.showGameOver();
                }
                continue;
            }
        }

        // Update towers
        for (const tower of this.towers) {
            tower.update(deltaTime, this.enemies);

            // Check projectile hits
            for (const projectile of tower.projectiles) {
                projectile.checkHit(this.enemies);
            }
        }

        // Remove dead enemies and award gold
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];

            if (enemy.isDead) {
                this.economy.onEnemyKilled(enemy.reward);
                this.enemies.splice(i, 1);
            }
        }

        // Check for wave completion
        if (this.waveManager.isWaveComplete()) {
            const reward = this.waveManager.getWaveReward();
            this.economy.onWaveComplete(reward);
            this.ui.showMessage(`Wave complete! +${reward} gold`, 'success', 3000);
            this.waveManager.clearWaveComplete();
        }

        // Update UI
        this.ui.update();
    }

    render() {
        this.renderer.clear();
        this.renderer.renderGrid(this.grid);

        // Render flow field if enabled
        if (this.renderer.showHeatmap) {
            this.renderer.renderFlowField(this.flowField, this.grid);
        }

        // Render spawn previews
        if (!this.waveManager.isWaveActive() && this.waveManager.nextWaveSpawnPoints.length > 0) {
            this.renderer.renderSpawnPreviews(this.grid, this.waveManager.nextWaveSpawnPoints);
        }

        // Render placement preview
        if (this.ui.selectedTowerType && this.mouseGridX !== null && this.mouseGridY !== null) {
            const feedback = this.buildValidator.getPlacementFeedback(
                this.mouseGridX,
                this.mouseGridY,
                this.enemies
            );

            this.renderer.renderPlacementPreview(
                this.grid,
                this.mouseGridX,
                this.mouseGridY,
                feedback === 'valid'
            );
        }

        // Render entities
        this.renderer.renderTowers(this.towers, this.hoveredTower);
        this.renderer.renderProjectiles(this.towers);
        this.renderer.renderEnemies(this.enemies);
    }

    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.ui.showMessage('Welcome! Click "Start Game" to begin', 'info', 3000);
        this.gameLoop();
    }
}
