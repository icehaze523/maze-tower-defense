// Wave Management System
import { WAVE_CONFIG, getWaveReward } from './config.js';
import { Enemy } from './Enemy.js';

export class WaveManager {
    constructor(grid) {
        this.grid = grid;
        this.currentWave = 0;
        this.waveActive = false;
        this.waveComplete = false;
        this.spawnQueue = [];
        this.nextSpawnTime = 0;
        this.waveStartTime = 0;

        // Preview for next wave
        this.nextWaveSpawnPoints = [];
    }

    startNextWave() {
        if (this.waveActive) return false;

        this.currentWave++;

        // Check if wave exists
        if (this.currentWave > WAVE_CONFIG.length) {
            // No more waves, player wins!
            return { victory: true };
        }

        const waveConfig = WAVE_CONFIG[this.currentWave - 1];

        // Build spawn queue
        this.spawnQueue = [];
        this.nextWaveSpawnPoints = [];

        for (const enemyGroup of waveConfig.enemies) {
            for (let i = 0; i < enemyGroup.count; i++) {
                const spawnPoint = this.grid.getRandomSpawnPoint();
                const spawnTime = Date.now() + i * enemyGroup.interval;

                this.spawnQueue.push({
                    type: enemyGroup.type,
                    spawnPoint: spawnPoint,
                    spawnTime: spawnTime
                });

                // Add to preview (only first few spawns)
                if (i < 3) {
                    this.nextWaveSpawnPoints.push(spawnPoint);
                }
            }
        }

        // Sort by spawn time
        this.spawnQueue.sort((a, b) => a.spawnTime - b.spawnTime);

        this.waveActive = true;
        this.waveComplete = false;
        this.waveStartTime = Date.now();

        return { victory: false, wave: this.currentWave };
    }

    update(enemies) {
        if (!this.waveActive) return [];

        const currentTime = Date.now();
        const newEnemies = [];

        // Spawn enemies from queue
        while (this.spawnQueue.length > 0 && this.spawnQueue[0].spawnTime <= currentTime) {
            const spawn = this.spawnQueue.shift();
            const enemy = new Enemy(
                spawn.spawnPoint.x,
                spawn.spawnPoint.y,
                spawn.type,
                this.currentWave
            );
            newEnemies.push(enemy);
        }

        // Check if wave is complete
        if (this.spawnQueue.length === 0 && enemies.length === 0) {
            this.waveActive = false;
            this.waveComplete = true;

            // Preview next wave spawn points
            if (this.currentWave < WAVE_CONFIG.length) {
                this.previewNextWave();
            }
        }

        return newEnemies;
    }

    previewNextWave() {
        this.nextWaveSpawnPoints = [];

        if (this.currentWave >= WAVE_CONFIG.length) return;

        const nextWaveConfig = WAVE_CONFIG[this.currentWave];

        // Get a few sample spawn points for preview
        for (let i = 0; i < 5; i++) {
            this.nextWaveSpawnPoints.push(this.grid.getRandomSpawnPoint());
        }
    }

    getWaveReward() {
        return getWaveReward(this.currentWave);
    }

    getRemainingEnemies() {
        return this.spawnQueue.length;
    }

    isWaveActive() {
        return this.waveActive;
    }

    isWaveComplete() {
        return this.waveComplete;
    }

    clearWaveComplete() {
        this.waveComplete = false;
    }
}
