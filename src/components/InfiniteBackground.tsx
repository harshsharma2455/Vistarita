import { Background, BackgroundVariant, useViewport } from '@xyflow/react';

export function InfiniteBackground() {
    const { zoom } = useViewport();

    // Fractal Grid Logic
    // Goal: Uniform dot size, constant density.

    // Base gap in pixels (at zoom 1)
    const baseGap = 60;

    // Calculate the current "level" of zoom
    const level = Math.floor(Math.log2(zoom));

    // Interpolation factor (0 to 1)
    const t = Math.log2(zoom) - level;

    // Scaling factors
    const scaleA = Math.pow(2, level);
    const scaleB = Math.pow(2, level + 1);

    // Gaps for the two layers
    const gapA = baseGap / scaleA;
    const gapB = baseGap / scaleB;

    // Constant screen-space size for dots
    // We want dots to appear roughly 2px-3px on screen regardless of zoom
    // Since 'size' prop is in flow units, we divide by zoom to get constant screen size.
    const dotSize = 2.5 / zoom;

    // Opacity Logic
    // Layer A (Sparse): Fades OUT as we zoom in (replaced by Layer B)
    const opacityA = 1 - t;

    // Layer B (Dense): Fades IN as we zoom in
    const opacityB = t;

    return (
        <div className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Layer A: The "Old" Level */}
            <Background
                id="bg-layer-a"
                variant={BackgroundVariant.Dots}
                gap={gapA}
                size={dotSize}
                color="#94a3b8" // Slate-400
                style={{ opacity: opacityA }}
                className="absolute inset-0 transition-none"
            />

            {/* Layer B: The "New" Level */}
            <Background
                id="bg-layer-b"
                variant={BackgroundVariant.Dots}
                gap={gapB}
                size={dotSize}
                color="#94a3b8" // Slate-400
                style={{ opacity: opacityB }}
                className="absolute inset-0 transition-none"
            />
        </div>
    );
}
