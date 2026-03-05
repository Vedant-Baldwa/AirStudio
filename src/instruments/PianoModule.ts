import { AudioEngine } from '../audio/audioEngine';
import { HandData } from '../hooks/useHandTracking';

export interface PianoKey {
    note: string;
    xStart: number;
    xEnd: number;
    isBlack: boolean;
}

const buildKeyLayout = (startOctave = 3, numOctaves = 2): PianoKey[] => {
    const whiteNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const blackNotes = ['C#', 'D#', '', 'F#', 'G#', 'A#', ''];
    const keys: PianoKey[] = [];

    const totalWhiteKeys = 7 * numOctaves;
    const keyWidth = 1.0 / totalWhiteKeys;

    let xOffset = 0;

    for (let octave = startOctave; octave < startOctave + numOctaves; octave++) {
        for (let i = 0; i < 7; i++) {
            // White key
            const note = whiteNotes[i] + octave;
            keys.push({ note, xStart: xOffset, xEnd: xOffset + keyWidth, isBlack: false });

            // Black key (superimposed)
            const bNote = blackNotes[i];
            if (bNote) {
                keys.push({
                    note: bNote + octave,
                    xStart: xOffset + keyWidth * 0.7, // Black key spans across
                    xEnd: xOffset + keyWidth * 1.3,
                    isBlack: true
                });
            }

            xOffset += keyWidth;
        }
    }

    // Sort: Black keys last so they render on top and trigger correctly (first match logic reversed)
    return keys;
};

export const PIANO_LAYOUT = buildKeyLayout();

export class PianoModule {
    private audio: AudioEngine;
    private activeKeys = new Set<string>();

    // Track which finger is pressing which key to prevent spam
    // Mapping finger ID -> note
    private fingerState = new Map<string, string>();

    constructor(audioEngine: AudioEngine) {
        this.audio = audioEngine;
    }

    public processFrame(leftHand: HandData | null, rightHand: HandData | null) {
        const currentFrameKeys = new Set<string>();

        this.processHand(leftHand, 'left', currentFrameKeys);
        this.processHand(rightHand, 'right', currentFrameKeys);

        // Diff checks
        // 1. Released keys
        for (const key of this.activeKeys) {
            if (!currentFrameKeys.has(key)) {
                this.audio.stopNote('piano', key);
                this.activeKeys.delete(key);
            }
        }

        // 2. Newly pressed keys are handled inside processHand
    }

    private processHand(hand: HandData | null, handName: string, currentFrameKeys: Set<string>) {
        if (!hand) return;

        // Extract fingertips
        const fingertips = [4, 8, 12, 16, 20];

        fingertips.forEach((lmIndex, i) => {
            const fingerId = `${handName}-${i}`;
            const lm = hand.landmarks[lmIndex];

            // Check if finger is low enough to "press" a key 
            if (lm.y > 0.82) {
                // Find matching key (reverse to check black keys first!)
                const hitKey = [...PIANO_LAYOUT].reverse().find(k => lm.x >= k.xStart && lm.x <= k.xEnd);

                if (hitKey) {
                    const note = hitKey.note;
                    currentFrameKeys.add(note);

                    // If this finger wasn't already pressing THIS note, trigger attack
                    if (this.fingerState.get(fingerId) !== note) {
                        this.fingerState.set(fingerId, note);

                        if (!this.activeKeys.has(note)) {
                            this.activeKeys.add(note);
                            // Velocity could be mapped to downward speed, but fixed at 0.8 is fine for now
                            this.audio.startNote('piano', note, 0.8);
                        }
                    }
                    return; // Don't process release logic for this finger
                }
            }

            // If finger is above the keyboard or not in a key, reset its state
            if (this.fingerState.has(fingerId)) {
                this.fingerState.delete(fingerId);
            }
        });
    }

    public getActiveKeys() {
        return Array.from(this.activeKeys);
    }
}
