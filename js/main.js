// Main entry point
import { Game } from './Game.js';

window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('game-canvas');

    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }

    try {
        const game = new Game(canvas);
        window.game = game; // For debugging
        console.log('Game initialized successfully!');
    } catch (error) {
        console.error('Failed to initialize game:', error);
        alert('Failed to start game. Please check the console for errors.');
    }
});
