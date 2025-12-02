// UI Controller
import { TOWER_TYPES } from './config.js';

export class UI {
    constructor(game) {
        this.game = game;
        this.selectedTowerType = null;

        // DOM elements
        this.goldDisplay = document.getElementById('gold');
        this.livesDisplay = document.getElementById('lives');
        this.waveDisplay = document.getElementById('wave');
        this.startWaveBtn = document.getElementById('start-wave');
        this.toggleHeatmapBtn = document.getElementById('toggle-heatmap');
        this.demolishBtn = document.getElementById('demolish-btn');
        this.messageDisplay = document.getElementById('message');

        this.setupEventListeners();
        this.createTowerButtons();
    }

    setupEventListeners() {
        // Start wave button
        this.startWaveBtn.addEventListener('click', () => {
            this.game.startWave();
        });

        // Toggle heatmap button
        this.toggleHeatmapBtn.addEventListener('click', () => {
            this.game.toggleHeatmap();
            this.toggleHeatmapBtn.textContent = this.game.renderer.showHeatmap ? '🗺️ Hide Path' : '🗺️ Show Path';
        });

        // Demolish button
        this.demolishBtn.addEventListener('click', () => {
            this.game.toggleDemolishMode();
            this.updateDemolishButton();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.selectedTowerType = null;
                this.game.demolishMode = false;
                this.updateTowerSelection();
                this.updateDemolishButton();
            }

            // Tower hotkeys: 1, 2, 3, 4, 5
            const towerKeys = ['1', '2', '3', '4', '5'];
            const towerTypes = Object.keys(TOWER_TYPES);
            const keyIndex = towerKeys.indexOf(e.key);

            if (keyIndex !== -1 && keyIndex < towerTypes.length) {
                this.game.demolishMode = false;
                this.updateDemolishButton();
                this.selectTower(towerTypes[keyIndex]);
            }

            // U to upgrade hovered tower
            if (e.key === 'u' || e.key === 'U') {
                if (this.game.hoveredTower) {
                    this.game.upgradeTower(this.game.hoveredTower);
                }
            }

            // Space to start wave
            if (e.key === ' ' && !this.game.waveManager.isWaveActive()) {
                e.preventDefault();
                this.game.startWave();
            }
        });
    }

    createTowerButtons() {
        const towerPanel = document.getElementById('tower-panel');
        const towerTypes = Object.keys(TOWER_TYPES);

        towerTypes.forEach((type, index) => {
            const config = TOWER_TYPES[type];
            const button = document.createElement('button');
            button.className = 'tower-btn';
            button.dataset.towerType = type;

            button.innerHTML = `
        <div class="tower-icon">${config.icon}</div>
        <div class="tower-name">${config.name}</div>
        <div class="tower-cost">💰 ${config.cost}</div>
        <div class="tower-hotkey">[${index + 1}]</div>
      `;

            // Tooltip - handle walls differently
            if (config.isWall) {
                button.title = `${config.description}\nHP: ${config.baseHP}`;
            } else {
                button.title = `${config.description}\nDamage: ${config.damage} | Range: ${config.range} | Fire Rate: ${config.fireRate}/s`;
            }

            button.addEventListener('click', () => {
                this.game.demolishMode = false;
                this.updateDemolishButton();
                this.selectTower(type);
            });

            towerPanel.appendChild(button);
        });
    }

    selectTower(type) {
        const config = TOWER_TYPES[type];

        if (!this.game.economy.canAfford(config.cost)) {
            this.showMessage('Not enough gold!', 'error');
            return;
        }

        this.selectedTowerType = type;
        this.updateTowerSelection();
    }

    updateDemolishButton() {
        if (this.game.demolishMode) {
            this.demolishBtn.classList.add('active');
            this.demolishBtn.textContent = '🔨 Demolishing...';
        } else {
            this.demolishBtn.classList.remove('active');
            this.demolishBtn.textContent = '🔨 Demolish';
        }
    }

    updateTowerSelection() {
        const buttons = document.querySelectorAll('.tower-btn');
        buttons.forEach(btn => {
            if (btn.dataset.towerType === this.selectedTowerType) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });
    }

    update() {
        // Update displays
        this.goldDisplay.textContent = this.game.economy.getGold();
        this.livesDisplay.textContent = this.game.lives;
        this.waveDisplay.textContent = `${this.game.waveManager.currentWave} / ${this.game.maxWaves}`;

        // Update start wave button
        if (this.game.waveManager.isWaveActive()) {
            this.startWaveBtn.disabled = true;
            this.startWaveBtn.textContent = `Enemies: ${this.game.waveManager.getRemainingEnemies() + this.game.enemies.length}`;
        } else {
            this.startWaveBtn.disabled = false;
            this.startWaveBtn.textContent = this.game.waveManager.currentWave === 0 ? 'Start Game' : 'Next Wave';
        }

        // Update tower button affordability
        const buttons = document.querySelectorAll('.tower-btn');
        buttons.forEach(btn => {
            const type = btn.dataset.towerType;
            const config = TOWER_TYPES[type];
            const canAfford = this.game.economy.canAfford(config.cost);

            if (canAfford) {
                btn.classList.remove('disabled');
            } else {
                btn.classList.add('disabled');
            }
        });
    }

    showMessage(text, type = 'info', duration = 2000) {
        this.messageDisplay.textContent = text;
        this.messageDisplay.className = `message ${type}`;
        this.messageDisplay.style.display = 'block';

        setTimeout(() => {
            this.messageDisplay.style.display = 'none';
        }, duration);
    }

    showGameOver() {
        const modal = document.getElementById('game-over-modal');
        const finalWave = document.getElementById('final-wave');
        finalWave.textContent = this.game.waveManager.currentWave;
        modal.style.display = 'flex';
    }

    showVictory() {
        const modal = document.getElementById('victory-modal');
        modal.style.display = 'flex';
    }
}
