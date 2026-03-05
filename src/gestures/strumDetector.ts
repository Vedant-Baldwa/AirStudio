import { NormalizedLandmarkList } from '@mediapipe/hands';

interface StrumEvent {
    detected: boolean;
    direction: 'up' | 'down';
    velocity: number;
}

export class StrumDetector {
    private history: { y: number, time: number }[] = [];
    private lastStrumTime: number = 0;

    public detect(rightHandLandmarks: NormalizedLandmarkList | null): StrumEvent {
        if (!rightHandLandmarks) return { detected: false, direction: 'down', velocity: 0 };

        const now = Date.now();
        const wristY = rightHandLandmarks[0].y;

        this.history.push({ y: wristY, time: now });
        if (this.history.length > 8) {
            this.history.shift();
        }

        if (now - this.lastStrumTime < 100) {
            return { detected: false, direction: 'down', velocity: 0 };
        }

        if (this.history.length >= 5) {
            const current = this.history[this.history.length - 1];
            const past = this.history[this.history.length - 5];

            const dy = current.y - past.y;

            if (dy > 0.04) {
                this.lastStrumTime = now;
                return { detected: true, direction: 'down', velocity: Math.min(1, dy / 0.1) };
            } else if (dy < -0.04) {
                this.lastStrumTime = now;
                return { detected: true, direction: 'up', velocity: Math.min(1, Math.abs(dy) / 0.1) };
            }
        }

        return { detected: false, direction: 'down', velocity: 0 };
    }
}
