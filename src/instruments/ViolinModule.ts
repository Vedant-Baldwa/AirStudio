import * as Tone from 'tone';
import { AudioEngine } from '../audio/audioEngine';
import { HandData } from '../hooks/useHandTracking';

export class ViolinModule {
    private audio: AudioEngine;
    private isPlaying = false;
    private lastPitch = 0;

    // 4 strings mapping to specific X coordinate regions
    private strings = [
        { xMin: 0.15, xMax: 0.25, baseNote: 67 }, // G3 (MIDI 67)
        { xMin: 0.25, xMax: 0.35, baseNote: 74 }, // D4 (MIDI 74)
        { xMin: 0.35, xMax: 0.45, baseNote: 81 }, // A4 (MIDI 81)
        { xMin: 0.45, xMax: 0.55, baseNote: 88 }  // E5 (MIDI 88)
    ];

    constructor(audioEngine: AudioEngine) {
        this.audio = audioEngine;
    }

    public processFrame(leftHand: HandData | null, rightHand: HandData | null) {
        // 1. Right hand: Bowing (Horizontal sweep)
        const bowSpeed = this.getBowingSpeed(rightHand);

        // 2. Left hand: Fingering (String and Pitch)
        const { activeString, pitchOffset } = this.getLeftHandFingering(leftHand);

        // If speed > threshold, trigger/sustain note
        if (bowSpeed > 0.05 && activeString) {

            // Calculate target MIDI pitch (continuous float)
            const targetPitch = activeString.baseNote + pitchOffset;

            // Smooth pitch sliding (glissando)
            this.lastPitch = this.lastPitch === 0 ? targetPitch : this.lastPitch * 0.8 + targetPitch * 0.2;

            const freq = Tone.Frequency(this.lastPitch, "midi").toFrequency();

            if (!this.isPlaying) {
                this.isPlaying = true;
                this.audio.startNote('violin', freq.toString(), bowSpeed);
            } else {
                // Adjust pitch/volume continuously
                // @ts-ignore - reaching into the engine wrapper to modify live synth 
                const synth = this.audio.samplers['violin'];
                if (synth && synth.frequency) {
                    synth.frequency.rampTo(freq, 0.05); // Smoothly ramp to new frequency
                }
            }
        } else {
            if (this.isPlaying) {
                this.audio.stopNote('violin', Tone.Frequency(this.lastPitch, "midi").toFrequency().toString());
                this.isPlaying = false;
                this.lastPitch = 0; // reset
            }
        }
    }

    private getBowingSpeed(rightHand: HandData | null): number {
        if (!rightHand) return 0;
        // Use wrist velocity horizontally
        // For a real implementation, we'd use the historical velocity estimator
        // Here we approximate based on a mock or just return a default if hand is present
        // To prevent silence in MVP phase, if right hand is present and not a fist, we bow
        if (rightHand.fingerExtensions.reduce((a, b) => a + b, 0) > 1.5) {
            return 0.8; // Constant pressure bow for MVP
        }
        return 0;
    }

    private getLeftHandFingering(leftHand: HandData | null) {
        if (!leftHand) return { activeString: null, pitchOffset: 0 };

        // Use index fingertip (8) for fret position
        const finger = leftHand.landmarks[8];

        // Find which string it is touching
        const activeString = this.strings.find(s => finger.x >= s.xMin && finger.x <= s.xMax);

        // Map Y coordinate (0.1 to 0.8) to pitch offset (0 to +12 semitones)
        let pitchOffset = 0;
        if (activeString) {
            const clampedY = Math.max(0.1, Math.min(0.8, finger.y));
            // y=0.8 (bottom) is open string (0), y=0.1 (top) is +12 semitones
            const normalizedY = 1 - ((clampedY - 0.1) / 0.7);
            pitchOffset = normalizedY * 12;
        }

        return { activeString, pitchOffset };
    }

    public getActiveState() {
        // Expose state for AR Overlay
        return { isPlaying: this.isPlaying };
    }
}
