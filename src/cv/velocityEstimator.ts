import { NormalizedLandmark } from '@mediapipe/hands';

export class VelocityEstimator {
    private windowSize: number;
    private history: { pos: { x: number, y: number }, time: number }[] = [];

    constructor(windowSize: number = 6) {
        this.windowSize = windowSize;
    }

    public update(landmark: NormalizedLandmark) {
        this.history.push({
            pos: { x: landmark.x, y: landmark.y },
            time: performance.now()
        });
        if (this.history.length > this.windowSize) {
            this.history.shift();
        }
    }

    public getVelocity() {
        if (this.history.length < 2) return { vx: 0, vy: 0, speed: 0 };

        const oldest = this.history[0];
        const newest = this.history[this.history.length - 1];

        const dt = (newest.time - oldest.time) / 1000; // seconds
        if (dt <= 0) return { vx: 0, vy: 0, speed: 0 };

        const vx = (newest.pos.x - oldest.pos.x) / dt;
        const vy = (newest.pos.y - oldest.pos.y) / dt;

        return { vx, vy, speed: Math.sqrt(vx * vx + vy * vy) };
    }

    public reset() {
        this.history = [];
    }
}

export class HitDetector {
    private estimator = new VelocityEstimator(4);
    private lastHitTime = 0;
    private lastVy = 0;

    public detectHit(landmark: NormalizedLandmark | undefined): { hit: boolean, force: number } {
        if (!landmark) return { hit: false, force: 0 };

        this.estimator.update(landmark);
        const { vy, speed } = this.estimator.getVelocity();

        // Detect sudden change from downward (vy > 0) to upward (vy < 0) or simple fast downward piercing
        // In screen space, downward motion is POSITIVE vy.
        const hitTriggered = (vy > 2.0) || (this.lastVy > 1.5 && vy < 0);

        const now = performance.now();
        const timeSinceLast = now - this.lastHitTime;

        this.lastVy = vy;

        if (hitTriggered && timeSinceLast > 120) { // 120ms debounce
            this.lastHitTime = now;
            // Normalize speed to 0-1 force (assuming max reasonable speed is around 8 normalized units/sec)
            const force = Math.min(1, Math.max(0.3, speed / 8));
            return { hit: true, force };
        }

        return { hit: false, force: 0 };
    }
}
