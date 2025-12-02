// Tower System
import { TOWER_TYPES, CONFIG, getUpgradeCost, getTowerDamage, getWallHP, UPGRADE_CONFIG } from './config.js';

export class Tower {
    constructor(x, y, type) {
        this.gridX = x;
        this.gridY = y;
        this.type = type;
        this.config = TOWER_TYPES[type];

        // Position in screen coordinates
        const screenPos = { x: x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2, y: y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2 };
        this.x = screenPos.x;
        this.y = screenPos.y;

        // Upgrade system
        this.level = 1;
        this.totalInvestment = this.config.cost; // Track for refunds

        // Wall HP system
        if (this.config.isWall) {
            this.maxHP = getWallHP(this.level);
            this.hp = this.maxHP;
        }

        this.lastFireTime = 0;
        this.target = null;
        this.projectiles = [];
    }

    update(deltaTime, enemies) {
        // Walls don't attack
        if (this.config.isWall) {
            return;
        }

        const currentTime = Date.now();
        const fireInterval = 1000 / this.config.fireRate;

        // Find target
        this.target = this.findTarget(enemies);

        // Fire if ready and has target
        if (this.target && currentTime - this.lastFireTime >= fireInterval) {
            this.fire();
            this.lastFireTime = currentTime;
        }

        // Update projectiles
        this.projectiles = this.projectiles.filter(p => {
            p.update(deltaTime);
            return !p.isDead;
        });
    }

    findTarget(enemies) {
        const rangeSq = (this.config.range * CONFIG.CELL_SIZE) ** 2;
        let closest = null;
        let closestDist = Infinity;

        for (const enemy of enemies) {
            if (enemy.isDead) continue;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distSq = dx * dx + dy * dy;

            if (distSq <= rangeSq && distSq < closestDist) {
                closest = enemy;
                closestDist = distSq;
            }
        }

        return closest;
    }

    fire() {
        if (!this.target) return;

        // Get current damage based on level
        const currentDamage = getTowerDamage(this.type, this.level);

        const projectile = new Projectile(
            this.x,
            this.y,
            this.target,
            this.config,
            currentDamage
        );

        this.projectiles.push(projectile);
    }

    // Upgrade system methods
    canUpgrade() {
        return this.level < UPGRADE_CONFIG.MAX_LEVEL;
    }

    getUpgradeCost() {
        return getUpgradeCost(this.type, this.level);
    }

    upgrade() {
        if (!this.canUpgrade()) return false;

        this.level++;
        const upgradeCost = getUpgradeCost(this.type, this.level - 1);
        this.totalInvestment += upgradeCost;

        // Update wall HP if it's a wall
        if (this.config.isWall) {
            const oldMaxHP = this.maxHP;
            this.maxHP = getWallHP(this.level);
            this.hp = this.maxHP; // Fully heal on upgrade
        }

        return true;
    }

    takeDamage(amount) {
        if (!this.config.isWall) return false;

        this.hp -= amount;
        if (this.hp <= 0) {
            this.hp = 0;
            return true; // Tower destroyed
        }
        return false;
    }

    render(ctx) {
        // Draw tower base
        ctx.fillStyle = this.config.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, CONFIG.CELL_SIZE * 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw tower icon
        ctx.font = `${CONFIG.CELL_SIZE * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.icon, this.x, this.y);

        // Draw upgrade level stars
        if (this.level > 1) {
            ctx.font = `${CONFIG.CELL_SIZE * 0.2}px Arial`;
            ctx.fillStyle = '#ffd700';
            const stars = '⭐'.repeat(this.level - 1);
            ctx.fillText(stars, this.x, this.y - CONFIG.CELL_SIZE * 0.45);
        }

        // Draw HP bar for walls
        if (this.config.isWall) {
            this.renderHealthBar(ctx);
        }
    }

    renderHealthBar(ctx) {
        const barWidth = CONFIG.CELL_SIZE * 0.8;
        const barHeight = 4;
        const barX = this.x - barWidth / 2;
        const barY = this.y + CONFIG.CELL_SIZE * 0.4;

        // Background
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health
        const hpPercent = this.hp / this.maxHP;
        ctx.fillStyle = hpPercent > 0.5 ? '#00ff00' : hpPercent > 0.25 ? '#ffff00' : '#ff0000';
        ctx.fillRect(barX, barY, barWidth * hpPercent, barHeight);
    }

    renderRange(ctx) {
        ctx.strokeStyle = this.config.color + '44';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.config.range * CONFIG.CELL_SIZE, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

export class Projectile {
    constructor(x, y, target, config, damage) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.config = config;
        this.speed = config.projectileSpeed;
        this.damage = damage || config.damage; // Use scaled damage if provided
        this.isDead = false;
        this.hitEnemies = new Set(); // For pierce tracking

        // Calculate direction to target
        const dx = target.x - x;
        const dy = target.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
    }

    update(deltaTime) {
        // Move projectile
        this.x += this.vx * deltaTime / 16.67; // Normalize to 60fps
        this.y += this.vy * deltaTime / 16.67;

        // Check if too far from origin (cleanup)
        if (Math.abs(this.x) > 2000 || Math.abs(this.y) > 2000) {
            this.isDead = true;
        }
    }

    checkHit(enemies) {
        const hitRadius = 10;
        const hits = [];

        for (const enemy of enemies) {
            if (enemy.isDead) continue;
            if (this.hitEnemies.has(enemy)) continue; // Already hit by this projectile

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < hitRadius + enemy.size * CONFIG.CELL_SIZE) {
                hits.push(enemy);
                this.hitEnemies.add(enemy);
            }
        }

        if (hits.length > 0) {
            // Apply damage
            if (this.config.splashRadius) {
                // Splash damage
                this.applySplashDamage(enemies);
                this.isDead = true;
            } else if (this.config.pierceCount !== undefined) {
                // Pierce damage
                for (const enemy of hits) {
                    enemy.takeDamage(this.damage);

                    // Apply slow effect if applicable
                    if (this.config.slowEffect) {
                        enemy.applySlowEffect(this.config.slowEffect, this.config.slowDuration);
                    }
                }

                // Check if pierce limit reached
                if (this.hitEnemies.size >= this.config.pierceCount) {
                    this.isDead = true;
                }
            } else {
                // Normal single-target damage
                hits[0].takeDamage(this.damage);

                // Apply slow effect if applicable
                if (this.config.slowEffect) {
                    hits[0].applySlowEffect(this.config.slowEffect, this.config.slowDuration);
                }

                this.isDead = true;
            }
        }

        return hits;
    }

    applySplashDamage(enemies) {
        const splashRadiusPx = this.config.splashRadius * CONFIG.CELL_SIZE;

        for (const enemy of enemies) {
            if (enemy.isDead) continue;

            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= splashRadiusPx) {
                enemy.takeDamage(this.damage);
            }
        }
    }

    render(ctx) {
        ctx.fillStyle = this.config.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.config.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}
