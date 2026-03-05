import { NormalizedLandmarkList } from '@mediapipe/hands';

// This MVP uses a simple heuristic classifier instead of loading an external pre-trained model.
// Loading external models often fails due to CORS or requires complex training pipelines,
// so for this iteration, we map distinct left hand geometric states to instrument selections:
// - OPEN PALM: Guitar
// - FIST: Drums
// - PEACE SIGN: Piano
// - ROCK SIGN (Index+Pinky): Violin

export type PredictedInstrument = 'guitar' | 'drums' | 'piano' | 'violin' | 'unknown';

export class GestureClassifier {

    public predictInstrument(landmarks: NormalizedLandmarkList): PredictedInstrument {
        // We define simple rules based on fingertip Y vs knuckle Y to estimate extension
        // 0 = WRIST
        // 8 = INDEX tip, 5 = INDEX knuckle
        // 12 = MIDDLE tip, 9 = MIDDLE knuckle
        // 16 = RING tip, 13 = RING knuckle
        // 20 = PINKY tip, 17 = PINKY knuckle

        const isIndexExtended = landmarks[8].y < landmarks[5].y;
        const isMiddleExtended = landmarks[12].y < landmarks[9].y;
        const isRingExtended = landmarks[16].y < landmarks[13].y;
        const isPinkyExtended = landmarks[20].y < landmarks[17].y;

        const numExtended = [isIndexExtended, isMiddleExtended, isRingExtended, isPinkyExtended].filter(Boolean).length;

        // FIST -> Drums
        if (numExtended === 0) {
            return 'drums';
        }

        // OPEN PALM -> Guitar 
        // (We require at least 3 fingers up so it's clearly an open hand)
        if (numExtended >= 3) {
            return 'guitar';
        }

        // PEACE SIGN -> Piano
        if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
            return 'piano';
        }

        // ROCK SIGN -> Violin
        if (isIndexExtended && isPinkyExtended && !isMiddleExtended && !isRingExtended) {
            return 'violin';
        }

        return 'unknown';
    }
}
