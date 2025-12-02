# 🏰 Maze Tower Defense

A sophisticated tower defense game where **towers act as walls** to create dynamic mazes. Defend your base against enemies spawning from all directions!

## 🎮 Quick Start

### Play Now

```bash
# Server is already running! Just open:
http://localhost:8000

# Or to start the server manually:
cd /Users/liangyang/.gemini/antigravity/scratch/maze-tower-defense
python3 -m http.server 8000
```

Then open **http://localhost:8000** in your browser.

## 🎯 Core Features

- **Dynamic Maze Building**: Towers are walls - create labyrinths to slow enemies
- **Wall Building**: Cheap 5-gold walls for pure blocking (no attack)
- **Demolition System**: Remove towers for 60% refund
- **Upgrade System**: 3 levels per tower with increasing damage/HP
- **Flying Enemies**: Special units that bypass terrain (waves 10 & 15)
- **Multi-directional Spawning**: Enemies attack from all map edges
- **Smart Path Validation**: Cannot completely block enemy paths
- **Flow Field Pathfinding**: Efficient AI for hundreds of enemies
- **30 Progressive Waves**: Increasing difficulty with mixed enemy types
- **5 Tower Types**: Wall, Machine Gun, Slow, Pierce, Splash
- **4 Enemy Types**: Grunts, Runners, Siege Units, Flyers

## 🎮 How to Play

1. **Start Game**: Click "Start Game" button (200 gold, 20 lives)
2. **Build Walls**: Select towers (1-5 keys) and click to place
3. **Create Mazes**: Force enemies to take longer paths
4. **Upgrade Towers**: Hover and press 'U' to upgrade (max level 3)
5. **Demolish**: Toggle demolish mode to remove towers (60% refund)
6. **Defend**: Towers auto-attack enemies in range
7. **Survive**: Complete all 30 waves to win!

### Controls

| Input | Action |
|-------|--------|
| **1-5** | Select tower type |
| **U** | Upgrade hovered tower |
| **Mouse Click** | Place tower / Demolish tower |
| **ESC** | Cancel selection |
| **SPACE** | Start next wave |
| **🗺️ Button** | Toggle path heatmap |
| **🔨 Button** | Toggle demolish mode |

## 🗼 Tower Types

| Tower | Cost | Damage | Special |
|-------|------|--------|---------|
| 🧱 Wall | 5g | - | Blocks enemies, 100 HP, no attack |
| 🔫 Machine Gun | 10g | 6.5 | Rapid fire (10/s) |
| ❄️ Slow Tower | 25g | 2.6 | 50% slow effect |
| ⚡ Pierce Cannon | 50g | 26 | Infinite pierce |
| 💣 Splash Mortar | 75g | 19.5 | Area damage (1.5 cells) |

**Upgrades:** All towers can be upgraded 3 times (cost: 1.5× base)
- Attack towers: +50% damage per level
- Walls: +100% HP per level

## 👾 Enemy Types

| Enemy | HP Formula | Speed | Reward | Special |
|-------|-----------|-------|--------|---------|
| 👾 Grunt | 50 × 1.1^wave | 1.0x | 10g | Standard |
| ⚡ Runner | 30 × 1.1^wave | 2.0x | 15g | Fast |
| 🛡️ Siege | 200 × 1.1^wave | 0.5x | 50g | Disables nearby towers |
| ✈️ Flyer | 40 × 1.1^wave | 1.5x | 20g | Ignores terrain (waves 10+) |

## 💡 Strategy Tips

1. **Start with cheap walls** - Machine Gun towers (10g) are perfect for maze building
2. **Create long corridors** - Longer paths = more time for towers to shoot
3. **Use slow towers** - Amplify maze effectiveness by slowing enemies
4. **Watch spawn previews** - Red squares show where next wave spawns
5. **Can't block completely** - Game prevents sealing off all paths (anti-exploit)

## 🏗️ Technical Highlights

- **Pure Vanilla JavaScript** - No frameworks, no dependencies
- **ES6 Modules** - Clean, modular architecture
- **Flow Field Algorithm** - O(n) pathfinding shared by all enemies
- **Canvas Rendering** - 60 FPS with 50+ enemies
- **Real-time Validation** - Instant feedback on tower placement
- **Premium Design** - Glassmorphism UI, gradient colors, smooth animations

## 📁 Project Structure

```
maze-tower-defense/
├── index.html          # Main page
├── styles.css          # Premium styling
├── js/
│   ├── config.js       # Game balance & tower/enemy configs
│   ├── Grid.js         # 20×20 grid system
│   ├── Pathfinding.js  # Flow Field algorithm
│   ├── BuildValidator.js # Path blocking prevention
│   ├── Tower.js        # Tower & projectile systems
│   ├── Enemy.js        # Enemy AI & movement
│   ├── WaveManager.js  # Wave spawning logic
│   ├── Economy.js      # Gold management
│   ├── Renderer.js     # Canvas rendering
│   ├── UI.js           # Interface controller
│   ├── Game.js         # Main game engine
│   └── main.js         # Entry point
└── README.md          # This file
```

## 🎨 Visual Design

- **Dark Theme**: Deep space blue background (#0a0e27)
- **Accent Colors**: Cyan (#00ffff) + Magenta (#ff00ff)
- **Effects**: Glassmorphism, gradients, glowing elements
- **Animations**: Smooth hover states, pulsing spawn indicators

## 🏆 Win Condition

Survive all **30 waves** without losing all 20 lives!

## 📝 Development Notes

Built with modern web standards:
- ES6 modules for clean architecture
- HTML5 Canvas for high-performance rendering
- CSS3 for premium visual effects
- Flow Field pathfinding (from base outward)
- Build validation prevents game-breaking exploits

Total implementation: **~2000 lines of code** across 12 modules

---

**Enjoy the game! 🎮**

For questions or improvements, check the source code - it's well-commented and modular.
