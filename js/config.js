// Game Configuration and Constants
export const CONFIG = {
  // Grid settings
  GRID_SIZE: 20,
  CELL_SIZE: 40,

  // Game settings
  INITIAL_GOLD: 200,
  INITIAL_LIVES: 20,
  FPS: 60,

  // Visual settings
  COLORS: {
    background: '#0a0e27',
    grid: '#1a1f3a',
    gridLine: '#2a2f4a',
    base: '#ff00ff',
    baseGlow: '#ff00ff88',
    path: '#00ffff',
    pathGlow: '#00ffff44',
    enemy: '#ff3366',
    tower: '#00cc88',
    gold: '#ffd700',
    validPlacement: '#00ff0044',
    invalidPlacement: '#ff000044',
    uiPanel: '#1a1f3aee',
    uiAccent: '#00ffff',
    text: '#ffffff',
    textSecondary: '#aaaaaa'
  },

  // Pathfinding
  PATHFINDING_UPDATE_DELAY: 50, // ms to debounce recalculation
};

// Tower definitions
export const TOWER_TYPES = {
  WALL: {
    name: 'Wall',
    cost: 5,
    baseHP: 100,
    color: '#888888',
    description: 'Cheap defensive wall. No attack, blocks enemies.',
    icon: '🧱',
    isWall: true
  },
  MACHINE_GUN: {
    name: 'Machine Gun',
    cost: 10,
    damage: 6.5, // Increased by 30%
    range: 2,
    fireRate: 10, // shots per second
    projectileSpeed: 8,
    color: '#00cc88',
    description: 'Cheap, fast-firing tower. Perfect for walls.',
    icon: '🔫'
  },
  SLOW: {
    name: 'Slow Tower',
    cost: 25,
    damage: 2.6, // Increased by 30%
    range: 2.5,
    fireRate: 2,
    projectileSpeed: 6,
    slowEffect: 0.5, // 50% slow
    slowDuration: 2000, // ms
    color: '#6699ff',
    description: 'Slows enemies, making mazes more effective.',
    icon: '❄️'
  },
  PIERCE: {
    name: 'Pierce Cannon',
    cost: 50,
    damage: 26, // Increased by 30%
    range: 4,
    fireRate: 1,
    projectileSpeed: 12,
    pierceCount: 999, // infinite pierce
    color: '#ff9900',
    description: 'Shoots through multiple enemies in a line.',
    icon: '⚡'
  },
  SPLASH: {
    name: 'Splash Mortar',
    cost: 75,
    damage: 19.5, // Increased by 30%
    range: 3,
    fireRate: 0.5,
    projectileSpeed: 5,
    splashRadius: 1.5,
    color: '#ff3366',
    description: 'Deals area damage. Great for crowds.',
    icon: '💣'
  }
};

// Enemy definitions
export const ENEMY_TYPES = {
  GRUNT: {
    name: 'Grunt',
    baseHP: 50,
    speed: 1.0,
    reward: 10,
    color: '#ff3366',
    size: 0.3,
    description: 'Standard enemy unit',
    icon: '👾',
    isFlying: false
  },
  RUNNER: {
    name: 'Runner',
    baseHP: 30,
    speed: 2.0,
    reward: 15,
    color: '#ffff00',
    size: 0.25,
    description: 'Fast but fragile',
    icon: '⚡',
    isFlying: false
  },
  SIEGE: {
    name: 'Siege Unit',
    baseHP: 200,
    speed: 0.5,
    reward: 50,
    color: '#9933ff',
    size: 0.4,
    disableRadius: 2, // cells
    description: 'Slow, tanky, disables nearby towers',
    icon: '🛡️',
    isFlying: false
  },
  FLYER: {
    name: 'Flyer',
    baseHP: 40,
    speed: 1.5,
    reward: 20,
    color: '#00ddff',
    size: 0.28,
    description: 'Flying unit, ignores terrain and walls',
    icon: '✈️',
    isFlying: true
  }
};

// Wave configurations (first 30 waves)
export const WAVE_CONFIG = [
  // Wave 1-5: Tutorial waves
  { wave: 1, enemies: [{ type: 'GRUNT', count: 5, interval: 1000 }] },
  { wave: 2, enemies: [{ type: 'GRUNT', count: 8, interval: 900 }] },
  { wave: 3, enemies: [{ type: 'GRUNT', count: 10, interval: 800 }, { type: 'RUNNER', count: 2, interval: 1000 }] },
  { wave: 4, enemies: [{ type: 'GRUNT', count: 12, interval: 700 }] },
  { wave: 5, enemies: [{ type: 'GRUNT', count: 10, interval: 600 }, { type: 'RUNNER', count: 5, interval: 800 }] },

  // Wave 6-10: Introduce variety
  { wave: 6, enemies: [{ type: 'GRUNT', count: 15, interval: 600 }] },
  { wave: 7, enemies: [{ type: 'RUNNER', count: 10, interval: 500 }] },
  { wave: 8, enemies: [{ type: 'GRUNT', count: 12, interval: 500 }, { type: 'SIEGE', count: 1, interval: 5000 }] },
  { wave: 9, enemies: [{ type: 'GRUNT', count: 18, interval: 500 }, { type: 'RUNNER', count: 6, interval: 600 }] },
  { wave: 10, enemies: [{ type: 'SIEGE', count: 2, interval: 3000 }, { type: 'GRUNT', count: 15, interval: 400 }, { type: 'FLYER', count: 5, interval: 2000 }] },

  // Wave 11-15: Increasing difficulty
  { wave: 11, enemies: [{ type: 'GRUNT', count: 20, interval: 400 }, { type: 'RUNNER', count: 8, interval: 500 }] },
  { wave: 12, enemies: [{ type: 'RUNNER', count: 15, interval: 400 }] },
  { wave: 13, enemies: [{ type: 'GRUNT', count: 25, interval: 350 }, { type: 'SIEGE', count: 2, interval: 4000 }] },
  { wave: 14, enemies: [{ type: 'GRUNT', count: 20, interval: 300 }, { type: 'RUNNER', count: 10, interval: 400 }, { type: 'SIEGE', count: 1, interval: 2000 }] },
  { wave: 15, enemies: [{ type: 'SIEGE', count: 3, interval: 2500 }, { type: 'RUNNER', count: 12, interval: 350 }, { type: 'FLYER', count: 10, interval: 1500 }] },

  // Wave 16-20: Advanced challenges
  { wave: 16, enemies: [{ type: 'GRUNT', count: 30, interval: 300 }] },
  { wave: 17, enemies: [{ type: 'RUNNER', count: 20, interval: 300 }] },
  { wave: 18, enemies: [{ type: 'GRUNT', count: 25, interval: 250 }, { type: 'RUNNER', count: 15, interval: 300 }, { type: 'SIEGE', count: 2, interval: 3000 }] },
  { wave: 19, enemies: [{ type: 'SIEGE', count: 4, interval: 2000 }, { type: 'GRUNT', count: 20, interval: 250 }] },
  { wave: 20, enemies: [{ type: 'GRUNT', count: 30, interval: 200 }, { type: 'RUNNER', count: 20, interval: 250 }, { type: 'SIEGE', count: 3, interval: 2000 }] },

  // Wave 21-25: Expert level
  { wave: 21, enemies: [{ type: 'RUNNER', count: 30, interval: 250 }] },
  { wave: 22, enemies: [{ type: 'GRUNT', count: 40, interval: 200 }, { type: 'SIEGE', count: 4, interval: 2000 }] },
  { wave: 23, enemies: [{ type: 'GRUNT', count: 35, interval: 180 }, { type: 'RUNNER', count: 25, interval: 200 }] },
  { wave: 24, enemies: [{ type: 'SIEGE', count: 5, interval: 1500 }, { type: 'RUNNER', count: 20, interval: 200 }] },
  { wave: 25, enemies: [{ type: 'GRUNT', count: 40, interval: 150 }, { type: 'RUNNER', count: 30, interval: 180 }, { type: 'SIEGE', count: 5, interval: 1500 }] },

  // Wave 26-30: Mastery
  { wave: 26, enemies: [{ type: 'RUNNER', count: 40, interval: 180 }] },
  { wave: 27, enemies: [{ type: 'GRUNT', count: 50, interval: 150 }, { type: 'SIEGE', count: 6, interval: 1500 }] },
  { wave: 28, enemies: [{ type: 'SIEGE', count: 8, interval: 1200 }, { type: 'GRUNT', count: 30, interval: 150 }] },
  { wave: 29, enemies: [{ type: 'GRUNT', count: 50, interval: 120 }, { type: 'RUNNER', count: 40, interval: 150 }, { type: 'SIEGE', count: 4, interval: 1500 }] },
  { wave: 30, enemies: [{ type: 'GRUNT', count: 60, interval: 100 }, { type: 'RUNNER', count: 50, interval: 120 }, { type: 'SIEGE', count: 10, interval: 1000 }] },
];

// HP scaling formula: baseHP * (1.1 ^ waveIndex)
export function getEnemyHP(baseHP, waveIndex) {
  return Math.floor(baseHP * Math.pow(1.1, waveIndex));
}

// Wave reward formula: 50 + 10 * wave
export function getWaveReward(waveIndex) {
  return 50 + 10 * waveIndex;
}

// Upgrade system configuration
export const UPGRADE_CONFIG = {
  MAX_LEVEL: 3,
  DAMAGE_MULTIPLIER: 1.5, // Each level multiplies damage by 1.5
  HP_MULTIPLIER: 2.0, // Each level doubles HP for walls
  COST_MULTIPLIER: 1.5 // Each upgrade costs 1.5x base cost
};

// Calculate upgrade cost for a tower
export function getUpgradeCost(towerType, currentLevel) {
  if (currentLevel >= UPGRADE_CONFIG.MAX_LEVEL) return null;
  const baseCost = TOWER_TYPES[towerType].cost;
  return Math.floor(baseCost * UPGRADE_CONFIG.COST_MULTIPLIER);
}

// Calculate damage for current level
export function getTowerDamage(towerType, level) {
  const config = TOWER_TYPES[towerType];
  if (config.isWall || !config.damage) return 0;
  return config.damage * Math.pow(UPGRADE_CONFIG.DAMAGE_MULTIPLIER, level - 1);
}

// Calculate HP for walls at current level
export function getWallHP(level) {
  const baseHP = TOWER_TYPES.WALL.baseHP;
  return Math.floor(baseHP * Math.pow(UPGRADE_CONFIG.HP_MULTIPLIER, level - 1));
}
