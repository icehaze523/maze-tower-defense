// Rendering System
import { CONFIG } from './config.js';
import { NodeState } from './Grid.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.showHeatmap = false;
        this.hoveredCell = null;
    }

    clear() {
        this.ctx.fillStyle = CONFIG.COLORS.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderGrid(grid) {
        const ctx = this.ctx;

        // Draw grid lines
        ctx.strokeStyle = CONFIG.COLORS.gridLine;
        ctx.lineWidth = 1;

        for (let x = 0; x <= grid.size; x++) {
            ctx.beginPath();
            ctx.moveTo(x * CONFIG.CELL_SIZE, 0);
            ctx.lineTo(x * CONFIG.CELL_SIZE, grid.size * CONFIG.CELL_SIZE);
            ctx.stroke();
        }

        for (let y = 0; y <= grid.size; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * CONFIG.CELL_SIZE);
            ctx.lineTo(grid.size * CONFIG.CELL_SIZE, y * CONFIG.CELL_SIZE);
            ctx.stroke();
        }

        // Draw base
        const baseScreenPos = grid.gridToScreen(grid.baseX, grid.baseY);
        ctx.fillStyle = CONFIG.COLORS.base;
        ctx.shadowBlur = 20;
        ctx.shadowColor = CONFIG.COLORS.baseGlow;
        ctx.beginPath();
        ctx.arc(baseScreenPos.x, baseScreenPos.y, CONFIG.CELL_SIZE * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw base icon
        ctx.font = `${CONFIG.CELL_SIZE * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('🏰', baseScreenPos.x, baseScreenPos.y);
    }

    renderFlowField(flowField, grid) {
        if (!this.showHeatmap) return;

        const ctx = this.ctx;
        ctx.strokeStyle = CONFIG.COLORS.path;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.3;

        for (let y = 0; y < grid.size; y++) {
            for (let x = 0; x < grid.size; x++) {
                const direction = flowField.getDirection(x, y);
                if (!direction) continue;

                const screenPos = grid.gridToScreen(x, y);
                const arrowLength = CONFIG.CELL_SIZE * 0.3;
                const endX = screenPos.x + direction.dx * arrowLength;
                const endY = screenPos.y + direction.dy * arrowLength;

                // Draw arrow
                ctx.beginPath();
                ctx.moveTo(screenPos.x, screenPos.y);
                ctx.lineTo(endX, endY);
                ctx.stroke();

                // Draw arrowhead
                const angle = Math.atan2(direction.dy, direction.dx);
                const headLength = 8;
                ctx.beginPath();
                ctx.moveTo(endX, endY);
                ctx.lineTo(
                    endX - headLength * Math.cos(angle - Math.PI / 6),
                    endY - headLength * Math.sin(angle - Math.PI / 6)
                );
                ctx.moveTo(endX, endY);
                ctx.lineTo(
                    endX - headLength * Math.cos(angle + Math.PI / 6),
                    endY - headLength * Math.sin(angle + Math.PI / 6)
                );
                ctx.stroke();
            }
        }

        ctx.globalAlpha = 1.0;
    }

    renderPlacementPreview(grid, gridX, gridY, isValid) {
        if (gridX === null || gridY === null) return;

        const ctx = this.ctx;
        const screenPos = grid.gridToScreen(gridX, gridY);

        ctx.fillStyle = isValid ? CONFIG.COLORS.validPlacement : CONFIG.COLORS.invalidPlacement;
        ctx.fillRect(
            gridX * CONFIG.CELL_SIZE,
            gridY * CONFIG.CELL_SIZE,
            CONFIG.CELL_SIZE,
            CONFIG.CELL_SIZE
        );

        // Draw preview circle
        if (isValid) {
            ctx.strokeStyle = CONFIG.COLORS.uiAccent;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenPos.x, screenPos.y, CONFIG.CELL_SIZE * 0.3, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    renderSpawnPreviews(grid, spawnPoints) {
        const ctx = this.ctx;

        for (const spawn of spawnPoints) {
            const screenPos = grid.gridToScreen(spawn.x, spawn.y);

            // Pulsing effect
            const pulse = Math.sin(Date.now() / 300) * 0.1 + 0.9;

            ctx.fillStyle = `rgba(255, 51, 102, ${pulse * 0.3})`;
            ctx.fillRect(
                spawn.x * CONFIG.CELL_SIZE,
                spawn.y * CONFIG.CELL_SIZE,
                CONFIG.CELL_SIZE,
                CONFIG.CELL_SIZE
            );

            // Skull icon
            ctx.font = `${CONFIG.CELL_SIZE * 0.4}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#ff3366';
            ctx.fillText('☠️', screenPos.x, screenPos.y);
        }
    }

    renderTowers(towers, hoveredTower = null) {
        for (const tower of towers) {
            if (tower === hoveredTower) {
                tower.renderRange(this.ctx);
            }
            tower.render(this.ctx);
        }
    }

    renderEnemies(enemies) {
        for (const enemy of enemies) {
            enemy.render(this.ctx);
        }
    }

    renderProjectiles(towers) {
        for (const tower of towers) {
            for (const projectile of tower.projectiles) {
                projectile.render(this.ctx);
            }
        }
    }

    toggleHeatmap() {
        this.showHeatmap = !this.showHeatmap;
    }
}
