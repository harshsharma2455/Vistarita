// Simple 2D Perlin Noise implementation
// Based on standard algorithms

export class PerlinNoise {
    private permutation: number[];

    constructor() {
        this.permutation = new Array(512);
        const p = new Array(256);
        for (let i = 0; i < 256; i++) p[i] = i;

        // Shuffle
        for (let i = 255; i > 0; i--) {
            const n = Math.floor(Math.random() * (i + 1));
            [p[i], p[n]] = [p[n], p[i]];
        }

        // Duplicate for wrapping
        for (let i = 0; i < 512; i++) {
            this.permutation[i] = p[i & 255];
        }
    }

    private fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    private lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    private grad(hash: number, x: number, y: number): number {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }

    public noise(x: number, y: number): number {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;

        x -= Math.floor(x);
        y -= Math.floor(y);

        const u = this.fade(x);
        const v = this.fade(y);

        const A = this.permutation[X] + Y;
        const AA = this.permutation[A];
        const AB = this.permutation[A + 1];
        const B = this.permutation[X + 1] + Y;
        const BA = this.permutation[B];
        const BB = this.permutation[B + 1];

        return this.lerp(
            v,
            this.lerp(u, this.grad(this.permutation[AA], x, y), this.grad(this.permutation[BA], x - 1, y)),
            this.lerp(u, this.grad(this.permutation[AB], x, y - 1), this.grad(this.permutation[BB], x - 1, y - 1))
        );
    }
}

export const perlin = new PerlinNoise();
