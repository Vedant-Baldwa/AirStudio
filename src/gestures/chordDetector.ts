import { NormalizedLandmarkList } from '@mediapipe/hands';
import { getFingerExtension } from '../cv/landmarkUtils';
import { isFistClosed } from './ruleEngine';

const CHORDS = ['G_MAJOR', 'C_MAJOR', 'D_MAJOR', 'E_MINOR', 'A_MINOR', 'E5_POWER'] as const;
export type ChordName = typeof CHORDS[number];

export const detectChord = (landmarks: NormalizedLandmarkList | null): { chord: ChordName | null, confidence: number } => {
    if (!landmarks) return { chord: null, confidence: 0 };

    const ext = [0, 1, 2, 3, 4].map(i => getFingerExtension(landmarks, i));

    if (isFistClosed(landmarks)) {
        return { chord: 'E_MINOR', confidence: 0.9 };
    }

    if (ext[1] > 0.7 && ext[2] < 0.3 && ext[3] < 0.3 && ext[4] < 0.3) {
        return { chord: 'E5_POWER', confidence: 0.8 };
    }

    if (ext[0] > 0.6 && ext[1] > 0.6 && ext[4] > 0.6 && ext[2] < 0.4 && ext[3] < 0.4) {
        return { chord: 'G_MAJOR', confidence: 0.85 };
    }

    if (ext[1] > 0.6 && ext[2] < 0.4 && ext[3] < 0.4 && ext[4] < 0.4) {
        return { chord: 'C_MAJOR', confidence: 0.7 };
    }

    if (ext[1] > 0.3 && ext[1] < 0.7 && ext[2] > 0.3 && ext[2] < 0.7 && ext[3] > 0.3 && ext[3] < 0.7) {
        return { chord: 'D_MAJOR', confidence: 0.7 };
    }

    if (ext[0] > 0.7 && ext[1] < 0.4 && ext[2] < 0.4 && ext[3] < 0.4) {
        return { chord: 'A_MINOR', confidence: 0.75 };
    }

    return { chord: null, confidence: 0 };
};
