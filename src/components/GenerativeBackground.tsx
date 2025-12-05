import { useEffect, useRef } from 'react';
import { useViewport } from '@xyflow/react';

// Simple deterministic PRNG based on coordinates
const random = (x: number, y: number) => {
    const dot = x * 12.9898 + y * 78.233;
    const sin = Math.sin(dot) * 43758.5453123;
    return sin - Math.floor(sin);
};

export function GenerativeBackground() {
    const { x, y, zoom } = useViewport();
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const width = window.innerWidth;
        const height = window.innerHeight;

        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.scale(dpr, dpr);

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Grid settings
        const gridSize = 300 * zoom;

        const startCol = Math.floor(-x / gridSize);
        const startRow = Math.floor(-y / gridSize);
        const cols = Math.ceil(width / gridSize) + 2;
        const rows = Math.ceil(height / gridSize) + 2;

        ctx.strokeStyle = '#144256';
        ctx.lineWidth = 1 * zoom;

        for (let i = -1; i < cols; i++) {
            for (let j = -1; j < rows; j++) {
                const col = startCol + i;
                const row = startRow + j;

                // Calculate position
                const drawX = (col * gridSize) + x;
                const drawY = (row * gridSize) + y;

                // Generate unique seed for this cell
                const seed = random(col, row);

                ctx.save();
                ctx.translate(drawX + gridSize / 2, drawY + gridSize / 2);
                ctx.globalAlpha = 0.08; // Subtle opacity

                // "Story in Depth" logic
                if (zoom < 0.5) {
                    // Macro View: Cosmic Constellations
                    drawConstellation(ctx, gridSize, seed);
                } else {
                    // Micro View: Intricate Yantras / Kolams
                    drawYantra(ctx, gridSize, seed);
                }

                ctx.restore();
            }
        }
    }, [x, y, zoom]);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ position: 'absolute', top: 0, left: 0 }}
        />
    );
}

function drawConstellation(ctx: CanvasRenderingContext2D, size: number, seed: number) {
    const numStars = Math.floor(seed * 5) + 3;
    const stars = [];

    // Generate stars
    for (let k = 0; k < numStars; k++) {
        const starSeed = random(seed, k);
        const sx = (starSeed - 0.5) * size * 0.8;
        const sy = (random(starSeed, k + 1) - 0.5) * size * 0.8;
        stars.push({ x: sx, y: sy });

        ctx.beginPath();
        ctx.arc(sx, sy, 2, 0, Math.PI * 2);
        ctx.fill();
    }

    // Connect stars
    ctx.beginPath();
    ctx.moveTo(stars[0].x, stars[0].y);
    for (let k = 1; k < stars.length; k++) {
        ctx.lineTo(stars[k].x, stars[k].y);
    }
    ctx.stroke();
}

function drawYantra(ctx: CanvasRenderingContext2D, size: number, seed: number) {
    const type = Math.floor(seed * 4);
    const r = size * 0.35;

    ctx.beginPath();

    if (type === 0) {
        // Sri Yantra inspired triangles
        for (let k = 0; k < 3; k++) {
            ctx.moveTo(0, -r);
            ctx.lineTo(r * 0.866, r * 0.5);
            ctx.lineTo(-r * 0.866, r * 0.5);
            ctx.closePath();
            ctx.rotate(Math.PI / 3);
        }
    } else if (type === 1) {
        // Flower of Life circles
        for (let k = 0; k < 6; k++) {
            ctx.arc(r * 0.5, 0, r * 0.5, 0, Math.PI * 2);
            ctx.rotate(Math.PI / 3);
        }
    } else if (type === 2) {
        // Kolam loops (simplified)
        ctx.moveTo(-r, 0);
        ctx.bezierCurveTo(-r, -r, r, -r, r, 0);
        ctx.bezierCurveTo(r, r, -r, r, -r, 0);
        ctx.rotate(Math.PI / 4);
        ctx.moveTo(-r, 0);
        ctx.bezierCurveTo(-r, -r, r, -r, r, 0);
        ctx.bezierCurveTo(r, r, -r, r, -r, 0);
    } else {
        // Concentric geometric
        ctx.rect(-r / 2, -r / 2, r, r);
        ctx.rotate(Math.PI / 4);
        ctx.rect(-r / 2, -r / 2, r, r);
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2);
    }

    ctx.stroke();

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
}
