import { useEffect, useRef } from 'react';
import { useViewport } from '@xyflow/react';
import { perlin } from '../utils/perlin';

// Helper for "sketchy" lines
const drawSketchyLine = (
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    zoom: number
) => {
    const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const segments = Math.max(1, Math.floor(dist / (5 * zoom))); // More segments = more wobble

    ctx.beginPath();
    ctx.moveTo(x1, y1);

    for (let i = 1; i <= segments; i++) {
        const t = i / segments;
        const tx = x1 + (x2 - x1) * t;
        const ty = y1 + (y2 - y1) * t;

        // Add wobble based on noise
        const noiseX = (Math.random() - 0.5) * 2 * zoom;
        const noiseY = (Math.random() - 0.5) * 2 * zoom;

        ctx.lineTo(tx + noiseX, ty + noiseY);
    }
    ctx.stroke();
};

// Helper to draw a Warli-style figure
const drawFigure = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    scale: number,
    zoom: number,
    action: 'standing' | 'walking' | 'sitting'
) => {
    const s = scale * zoom;

    // Head
    ctx.beginPath();
    ctx.arc(x, y - 15 * s, 3 * s, 0, Math.PI * 2);
    // Sketchy fill for head
    ctx.fillStyle = '#144256';
    ctx.fill();

    // Body (Triangles)
    ctx.beginPath();
    // Upper body
    ctx.moveTo(x, y - 10 * s);
    ctx.lineTo(x - 5 * s, y - 2 * s);
    ctx.lineTo(x + 5 * s, y - 2 * s);
    ctx.closePath();

    // Lower body
    ctx.moveTo(x, y - 2 * s);
    ctx.lineTo(x - 6 * s, y + 8 * s);
    ctx.lineTo(x + 6 * s, y + 8 * s);
    ctx.closePath();
    ctx.fill();

    // Limbs (Sketchy Lines)
    ctx.lineWidth = 1.5 * zoom;

    // Arms
    if (action === 'walking') {
        drawSketchyLine(ctx, x - 4 * s, y - 8 * s, x - 10 * s, y - 5 * s, zoom);
        drawSketchyLine(ctx, x + 4 * s, y - 8 * s, x + 10 * s, y - 12 * s, zoom);
    } else {
        drawSketchyLine(ctx, x - 4 * s, y - 8 * s, x - 8 * s, y - 2 * s, zoom);
        drawSketchyLine(ctx, x + 4 * s, y - 8 * s, x + 8 * s, y - 2 * s, zoom);
    }

    // Legs
    if (action === 'walking') {
        drawSketchyLine(ctx, x - 3 * s, y + 8 * s, x - 6 * s, y + 18 * s, zoom);
        drawSketchyLine(ctx, x + 3 * s, y + 8 * s, x + 2 * s, y + 18 * s, zoom);
    } else {
        drawSketchyLine(ctx, x - 3 * s, y + 8 * s, x - 4 * s, y + 18 * s, zoom);
        drawSketchyLine(ctx, x + 3 * s, y + 8 * s, x + 4 * s, y + 18 * s, zoom);
    }
};

export function LivingMuralBackground() {
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

        // Configuration
        const cellSize = 200; // Size of grid cells for culling
        const noiseScale = 0.002; // Scale of noise for flow paths

        // Calculate visible grid range
        // We need to map screen coordinates back to world coordinates
        const startX = Math.floor(-x / zoom / cellSize) - 1;
        const startY = Math.floor(-y / zoom / cellSize) - 1;
        const endX = Math.floor((width - x) / zoom / cellSize) + 1;
        const endY = Math.floor((height - y) / zoom / cellSize) + 1;

        ctx.strokeStyle = '#144256';
        ctx.fillStyle = '#144256';
        ctx.globalAlpha = 0.15; // Subtle ink look

        for (let cx = startX; cx <= endX; cx++) {
            for (let cy = startY; cy <= endY; cy++) {
                // Use cell coordinates as seed for noise
                // We check center of cell
                const worldX = cx * cellSize;
                const worldY = cy * cellSize;

                const noiseVal = perlin.noise(worldX * noiseScale, worldY * noiseScale);

                // "Flow Path" logic: Only draw if noise is within a certain range (creating "rivers")
                // Range -0.1 to 0.1 creates paths
                if (noiseVal > -0.15 && noiseVal < 0.15) {

                    // Determine activity based on another noise layer
                    const activityNoise = perlin.noise(worldX * noiseScale * 2 + 100, worldY * noiseScale * 2 + 100);

                    // Calculate screen position
                    const screenX = worldX * zoom + x;
                    const screenY = worldY * zoom + y;

                    // Randomize position within cell slightly
                    const offsetX = (Math.abs(Math.sin(worldX)) * cellSize * 0.8);
                    const offsetY = (Math.abs(Math.cos(worldY)) * cellSize * 0.8);

                    const drawX = screenX + offsetX * zoom;
                    const drawY = screenY + offsetY * zoom;

                    if (activityNoise > 0.3) {
                        // Group of 2 interacting
                        drawFigure(ctx, drawX, drawY, 1, zoom, 'standing');
                        drawFigure(ctx, drawX + 30 * zoom, drawY, 1, zoom, 'walking');
                    } else if (activityNoise < -0.3) {
                        // Solitary walker
                        drawFigure(ctx, drawX, drawY, 1, zoom, 'walking');
                    } else {
                        // Small gathering (3)
                        drawFigure(ctx, drawX, drawY, 0.9, zoom, 'standing');
                        drawFigure(ctx, drawX + 25 * zoom, drawY + 10 * zoom, 0.9, zoom, 'sitting');
                        drawFigure(ctx, drawX - 20 * zoom, drawY + 5 * zoom, 0.9, zoom, 'standing');
                    }
                }
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
