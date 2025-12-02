// Enemy System
import { ENEMY_TYPES, CONFIG, getEnemyHP } from './config.js';

export class Enemy {
    constructor(x, y, type, waveIndex) {
        this.gridX = x;
        this.gridY = y;
        this.x = x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        this.y = y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;

        this.type = type;
        this.config = ENEMY_TYPES[type];
        this.waveIndex = waveIndex;

        this.maxHP = getEnemyHP(this.config.baseHP, waveIndex);
        this.hp = this.maxHP;
        this.speed = this.config.speed;
        this.currentSpeed = this.speed;
        this.size = this.config.size;
        this.reward = this.config.reward;

        this.isDead = false;
        this.reachedBase = false;

        // Movement
        this.targetX = this.x;
        this.targetY = this.y;
        this.moveProgress = 0;

        // Flying status
        this.isFlying = this.config.isFlying || false;

        // Status effects
        this.slowFactor = 1.0;
        this.slowEndTime = 0;

        // For siege units
        this.disabledTowers = new Set();
    }

    update(deltaTime, flowField, grid) {
        if (this.isDead || this.reachedBase) return;

        // Update slow effect
        const currentTime = Date.now();
        if (currentTime > this.slowEndTime) {
            this.slowFactor = 1.0;
        }

        this.currentSpeed = this.speed * this.slowFactor;

        // Get current grid position
        const currentGridX = Math.floor(this.x / CONFIG.CELL_SIZE);
        const currentGridY = Math.floor(this.y / CONFIG.CELL_SIZE);

        // Check if reached base
        if (currentGridX === grid.baseX && currentGridY === grid.baseY) {
            this.reachedBase = true;
            return;
        }

        // Get flow field direction
        const direction = flowField.getDirection(currentGridX, currentGridY);

        if (!direction) {
            // No path available, stay in place
            return;
        }

        // Calculate target position (next cell)
        const targetGridX = currentGridX + direction.dx;
        const targetGridY = currentGridY + direction.dy;
        this.targetX = targetGridX * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        this.targetY = targetGridY * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;

        // Move towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            const moveAmount = this.currentSpeed * (deltaTime / 16.67);
            const moveX = (dx / dist) * moveAmount;
            const moveY = (dy / dist) * moveAmount;

            // Don't overshoot
            if (Math.abs(moveX) < Math.abs(dx)) {
                this.x += moveX;
            } else {
                this.x = this.targetX;
            }

            if (Math.abs(moveY) < Math.abs(dy)) {
                this.y += moveY;
            } else {
                this.y = this.targetY;
            }
        }
    }

    takeDamage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            this.isDead = true;
        }
    }

    applySlowEffect(slowFactor, duration) {
        this.slowFactor = Math.min(this.slowFactor, slowFactor);
        this.slowEndTime = Math.max(this.slowEndTime, Date.now() + duration);
    }

    render(ctx) {
        if (this.isDead) return;

        // Draw enemy body
        ctx.fillStyle = this.config.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * CONFIG.CELL_SIZE, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw flying shadow
        if (this.isFlying) {
            ctx.fillStyle = '#00000044';
            ctx.beginPath();
            ctx.ellipse(this.x, this.y + this.size * CONFIG.CELL_SIZE + 5,
                this.size * CONFIG.CELL_SIZE * 0.8,
                this.size * CONFIG.CELL_SIZE * 0.4,
                0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw enemy icon
        ctx.font = `${this.size * CONFIG.CELL_SIZE}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.icon, this.x, this.y);

        // Draw health bar
        this.renderHealthBar(ctx);

        // Draw slow indicator
        if (this.slowFactor < 1.0) {
            ctx.fillStyle = '#6699ff';
            ctx.beginPath();
            ctx.arc(this.x, this.y - this.size * CONFIG.CELL_SIZE - 8, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw siege disable radius
        if (this.config.disableRadius) {
            ctx.strokeStyle = this.config.color + '22';
            ctx.lineWidth = 1;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.config.disableRadius * CONFIG.CELL_SIZE, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    renderHealthBar(ctx) {
        const barWidth = this.size * CONFIG.CELL_SIZE * 2;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y - this.size * CONFIG.CELL_SIZE - 10;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const hpPercent = this.hp / this.maxHP;
        ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
    }
}
