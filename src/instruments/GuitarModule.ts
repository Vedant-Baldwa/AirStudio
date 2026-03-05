import { AudioEngine } from '../audio/audioEngine';
import { StrumDetector } from '../gestures/strumDetector';
import { detectChord, ChordName } from '../gestures/chordDetector';
import { HandData } from '../hooks/useHandTracking';

const CHORD_NOTES: Record<ChordName, string[]> = {
    'G_MAJOR': ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
    'C_MAJOR': ['C3', 'E3', 'G3', 'C4', 'E4'],
    'D_MAJOR': ['D3', 'F#3', 'A3', 'D4'],
    'E_MINOR': ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
    'A_MINOR': ['A2', 'E3', 'A3', 'C4', 'E4'],
    'E5_POWER': ['E2', 'B2', 'E3']
};

export class GuitarModule {
    private audio: AudioEngine;
    private strumDetector: StrumDetector;
    private currentChord: ChordName | null = null;

    constructor(audioEngine: AudioEngine) {
        this.audio = audioEngine;
        this.strumDetector = new StrumDetector();
    }

    public processFrame(leftHand: HandData | null, rightHand: HandData | null) {
        // 1. Detect Left Hand Chord State
        const chordResult = detectChord(leftHand?.landmarks || null);
        if (chordResult.confidence > 0.65) {
            this.currentChord = chordResult.chord;
        }

        // 2. Detect Strum
        const strumEvent = this.strumDetector.detect(rightHand?.landmarks || null);

        // 3. Play audio if strummed and chord is mapped
        if (strumEvent.detected && this.currentChord) {
            const notes = CHORD_NOTES[this.currentChord];
            if (!notes) return;

            const baseVelocity = strumEvent.velocity * 0.5 + 0.3; // Give it a solid baseline

            // Arpeggiate notes slightly 12ms apart based on strum direction
            const delay = 0.012;

            const playOrder = strumEvent.direction === 'down' ? notes : [...notes].reverse();

            playOrder.forEach((note, index) => {
                this.audio.playNote('guitar', note, baseVelocity, '4n', index * delay);
            });
        }
    }

    public getCurrentChord() {
        return this.currentChord;
    }
}
