import { Background, BackgroundVariant, useViewport } from '@xyflow/react';

interface InfiniteBackgroundProps {
    color?: string;
    gap?: number;
    showGrid?: boolean;
    variant?: 'dots' | 'lines';
}

export function InfiniteBackground({ color = "#94a3b8", gap = 20, showGrid = true, variant = 'dots' }: InfiniteBackgroundProps) {
    const { zoom } = useViewport();

    if (!showGrid) return null;

    // --- Fractal Logic ---
    // The logic manages 2 concurrent layers to create the infinite zoom effect.
    // As you zoom in, the current "Level 0" fades out and "Level 1" (which becomes the new fine detail) fades in.

    // We determine the "fractal level" based on log2 of zoom
    const level = Math.floor(Math.log2(zoom));

    // 't' is the fractional part (0.0 to 1.0) of our progress through the current level.
    const t = Math.log2(zoom) - level;

    // Scaling factors for the two layers
    // Scale A corresponds to the broader grid that is expanding off-screen/becoming too large
    // Scale B corresponds to the finer grid that is emerging
    const scaleA = Math.pow(2, level);
    const scaleB = Math.pow(2, level + 1);

    // Grid Gaps (Distance between points)
    // The base gap is multiplied by 3 arbitrarily in the original code, we'll tune this.
    // For Lines: We want a standard 20px grid at 100% zoom.
    // For Dots: 20px is also reasonable.
    const baseGap = gap;

    // We effectively shift the "visible window" of gaps based on zoom.
    const gapA = baseGap / scaleA;
    const gapB = baseGap / scaleB;

    // --- Aesthetic Tuning ---

    // 1. Dot Logic: Bigger and Darker as requested
    // Dot size should be slightly larger to be visible.
    const dotSize = 3.0 / zoom;   // Increased from 2.0 to 3.0

    // 2. Line Logic: Primary (Major) vs Secondary (Minor)
    // Scale A is the "Larger" grid (Primary/Major relative to B)
    // Scale B is the "Smaller" grid (Secondary/Minor relative to A)
    // We want Scale A to appear thicker/darker than Scale B?
    // Actually, in fractal zoom, A becomes B. So the transition needs to be careful.
    // However, we can simply say the "Current Level" (A) is thicker than the "Next Level" (B).

    // Line Thickness:
    // Scale A (Major): 1.5px to 2px visual
    // Scale B (Minor): 0.5px to 1px visual
    const lineMajor = 2.0 / zoom;
    const lineMinor = 1.0 / zoom;

    const sizeA = variant === 'dots' ? dotSize : lineMajor;
    const sizeB = variant === 'dots' ? dotSize : lineMinor;

    // 2. Opacity Transition (Easing)
    // Custom fade curve: ease-in-out
    const opacityCurve = (val: number) => val * val * (3 - 2 * val); // Smoothstep

    let opacityA = 1 - opacityCurve(t);
    let opacityB = opacityCurve(t);

    // Tweaks for specific variants
    if (variant === 'lines') {
        // Lines: Major grid (A) should be strong, Minor grid (B) fading in.
        // We keep opacityA strong to show the "Primary" lines.
        // We ensure opacityB starts subtle.
        opacityA = Math.max(opacityA, 0.2); // Never fully vanish major lines if possible? No, fractal needs fade.

        // Actually, for pure graph paper feel, users usually want fixed pixels.
        // But for infinite zoom, we must fade.
        // Just ensuring A is thicker (lineMajor) helps the hierarchy.
    } else {
        // Dots: Make them more visible/darker
        // We can boost opacity slightly
        opacityA = Math.min(1, opacityA * 1.5);
        opacityB = Math.min(1, opacityB * 1.5);
    }

    const bgVariant = variant === 'lines' ? BackgroundVariant.Lines : BackgroundVariant.Dots;

    // Major Grid for Lines?
    // Often graph paper has a "Major" grid every 10 units.
    // Implementing a static Major grid overlay could look nice, but let's stick to the fractal dynamics for now
    // to keep it "infinite" without awkward pops. The current fractal logic inherently provides hierarchy 
    // because at any point you see two scales interfering slightly.

    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-300">
            {/* Layer A (Larger Gap, Fading Out, Thicker/Primary) */}
            <Background
                id="bg-layer-a"
                variant={bgVariant}
                gap={gapA}
                size={sizeA}
                color={color}
                style={{ opacity: opacityA }}
                className="absolute inset-0 transition-none"
            />

            {/* Layer B (Smaller Gap, Fading In, Thinner/Secondary) */}
            <Background
                id="bg-layer-b"
                variant={bgVariant}
                gap={gapB}
                size={sizeB}
                color={color}
                style={{ opacity: opacityB }}
                className="absolute inset-0 transition-none"
            />
        </div>
    );
}
