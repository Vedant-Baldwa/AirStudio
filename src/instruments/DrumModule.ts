import { AudioEngine } from '../audio/audioEngine';
import { HandData } from '../hooks/useHandTracking';
import { HitDetector } from '../cv/velocityEstimator';

interface DrumZone {
    name: string;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    note: string;
}

// Map hits to Tone.js Sampler or Synths. 
// Uses notes mapped in loadDrumSampler: C1=Kick, D1=Snare, F#1=Hihat
const DRUM_ZONES: DrumZone[] = [
    { name: 'KICK', yMin: 0.75, yMax: 1.00, xMin: 0.35, xMax: 0.65, note: 'C1' },
    { name: 'SNARE', yMin: 0.45, yMax: 0.70, xMin: 0.25, xMax: 0.50, note: 'D1' },
    { name: 'HIHAT', yMin: 0.15, yMax: 0.40, xMin: 0.55, xMax: 0.80, note: 'F#1' },
    { name: 'CRASH', yMin: 0.10, yMax: 0.35, xMin: 0.15, xMax: 0.40, note: 'C#2' /* fallback if loaded */ },
    { name: 'TOM1', yMin: 0.25, yMax: 0.50, xMin: 0.40, xMax: 0.60, note: 'A1' /* fallback */ },
    { name: 'TOM2', yMin: 0.35, yMax: 0.60, xMin: 0.60, xMax: 0.80, note: 'G1' /* fallback */ },
];

export class DrumModule {
    private audio: AudioEngine;
    private hitDetectorsLeft: Record<string, HitDetector> = {};
    private hitDetectorsRight: Record<string, HitDetector> = {};

    // Track active zones for AR visual rendering
    private activeZones: Set<string> = new Set();
    private zoneTimeoutIds: Record<string, any> = {};

    constructor(audioEngine: AudioEngine) {
        this.audio = audioEngine;

        // Create a hit detector for each finger that can independently strike
        // 8 = index tip, 12 = middle tip
        this.hitDetectorsLeft['index'] = new HitDetector();
        this.hitDetectorsLeft['middle'] = new HitDetector();
        this.hitDetectorsRight['index'] = new HitDetector();
        this.hitDetectorsRight['middle'] = new HitDetector();
    }

    public processFrame(leftHand: HandData | null, rightHand: HandData | null) {
        this.checkHandHits(leftHand, this.hitDetectorsLeft);
        this.checkHandHits(rightHand, this.hitDetectorsRight);
    }

    private checkHandHits(hand: HandData | null, detectors: Record<string, HitDetector>) {
        if (!hand) return;

        // Track both index (8) and middle (12) fingertips for drumming
        const fingers = [
            { id: 'index', lm: hand.landmarks[8] },
            { id: 'middle', lm: hand.landmarks[12] }
        ];

        for (const finger of fingers) {
            const { hit, force } = detectors[finger.id].detectHit(finger.lm);
            if (hit) {
                this.triggerZoneFromPosition(finger.lm.x, finger.lm.y, force);
            }
        }
    }

    private triggerZoneFromPosition(x: number, y: number, force: number) {
        const zone = DRUM_ZONES.find(z => x >= z.xMin && x <= z.xMax && y >= z.yMin && y <= z.yMax);

        if (zone) {
            // Play audio
            this.audio.playNote('drums', zone.note, force * 0.8 + 0.2, '8n');

            // Register visual hit
            this.markZoneActive(zone.name);
        }
    }

    private markZoneActive(zoneName: string) {
        this.activeZones.add(zoneName);

        if (this.zoneTimeoutIds[zoneName]) clearTimeout(this.zoneTimeoutIds[zoneName]);

        this.zoneTimeoutIds[zoneName] = setTimeout(() => {
            this.activeZones.delete(zoneName);
        }, 150); // visual flash duration
    }

    public getActiveZones(): string[] {
        return Array.from(this.activeZones);
    }
}

export const getDrumZones = () => DRUM_ZONES;
