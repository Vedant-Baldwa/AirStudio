import { NormalizedLandmarkList } from '@mediapipe/hands';
import { getFingerExtension, getPalmCenter, getPinchDistance } from '../cv/landmarkUtils';

export const isFistClosed = (landmarks: NormalizedLandmarkList): boolean => {
    const palm = getPalmCenter(landmarks);
    const fingertips = [4, 8, 12, 16, 20];
    for (const tipIdx of fingertips) {
        const tip = landmarks[tipIdx];
        const dist = Math.sqrt((tip.x - palm.x) ** 2 + (tip.y - palm.y) ** 2 + (tip.z - palm.z) ** 2);
        if (dist > 0.08) return false;
    }
    return true;
};

export const isOpenPalm = (landmarks: NormalizedLandmarkList): boolean => {
    for (let i = 0; i < 5; i++) {
        const ext = getFingerExtension(landmarks, i);
        if (ext <= 0.7) return false;
    }
    return true;
};

export const isRockSign = (landmarks: NormalizedLandmarkList): boolean => {
    const ext = [0, 1, 2, 3, 4].map(i => getFingerExtension(landmarks, i));
    return (ext[1] > 0.7 && ext[4] > 0.7) && (ext[2] < 0.3 && ext[3] < 0.3);
};

export const isHangLoose = (landmarks: NormalizedLandmarkList): boolean => {
    const ext = [0, 1, 2, 3, 4].map(i => getFingerExtension(landmarks, i));
    return (ext[0] > 0.6 && ext[4] > 0.6) && (ext[1] < 0.3 && ext[2] < 0.3 && ext[3] < 0.3);
};

export const isPointingUp = (landmarks: NormalizedLandmarkList): boolean => {
    const ext = [0, 1, 2, 3, 4].map(i => getFingerExtension(landmarks, i));
    return ext[1] > 0.7 && (ext[2] < 0.3 && ext[3] < 0.3 && ext[4] < 0.3);
};

export const isPinching = (landmarks: NormalizedLandmarkList): boolean => {
    return getPinchDistance(landmarks) < 0.05;
};
