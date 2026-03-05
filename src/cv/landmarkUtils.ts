import { NormalizedLandmarkList } from '@mediapipe/hands';

export const getFingerExtension = (landmarks: NormalizedLandmarkList, fingerIndex: number): number => {
    // 0=thumb, 1=index, 2=middle, 3=ring, 4=pinky
    const offsets = [1, 5, 9, 13, 17];
    const baseIdx = offsets[fingerIndex];

    // Follows joints baseIdx+1, +2, +3. Example index: 6, 7, 8
    const a = landmarks[baseIdx + 1];
    const b = landmarks[baseIdx + 2];
    const c = landmarks[baseIdx + 3];

    if (!a || !b || !c) return 0;

    const ba = { x: a.x - b.x, y: a.y - b.y };
    const bc = { x: c.x - b.x, y: c.y - b.y };

    const dot = (ba.x * bc.x + ba.y * bc.y);
    const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
    const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);

    const cosAngle = dot / (magBA * magBC + 1e-6);
    const angleRad = Math.acos(Math.max(-1, Math.min(1, cosAngle)));
    const angleDeg = angleRad * (180 / Math.PI);

    // Map 90 deg -> 0 (curled), 170 deg -> 1 (extended)
    let extension = (angleDeg - 90) / 80;
    return Math.max(0, Math.min(1, extension));
};

export const getWristVelocity = (currentLandmarks: NormalizedLandmarkList, prevLandmarks: NormalizedLandmarkList | null) => {
    if (!prevLandmarks) return { x: 0, y: 0, speed: 0 };

    const curr = currentLandmarks[0];
    const prev = prevLandmarks[0];

    const dx = curr.x - prev.x;
    const dy = curr.y - prev.y;
    const speed = Math.sqrt(dx * dx + dy * dy);

    return { x: dx, y: dy, speed };
};

export const getPalmCenter = (landmarks: NormalizedLandmarkList) => {
    const indices = [0, 5, 9, 13, 17];
    let sumX = 0, sumY = 0, sumZ = 0;
    indices.forEach(i => {
        sumX += landmarks[i].x;
        sumY += landmarks[i].y;
        sumZ += landmarks[i].z || 0;
    });
    return {
        x: sumX / indices.length,
        y: sumY / indices.length,
        z: sumZ / indices.length
    };
};

export const getHandTilt = (landmarks: NormalizedLandmarkList) => {
    const wrist = landmarks[0];
    const middleMcp = landmarks[9];
    const dx = middleMcp.x - wrist.x;
    const dy = middleMcp.y - wrist.y;
    return Math.atan2(dy, dx) * (180 / Math.PI);
};

export const getPinchDistance = (landmarks: NormalizedLandmarkList) => {
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];

    const dx = thumbTip.x - indexTip.x;
    const dy = thumbTip.y - indexTip.y;
    const dz = thumbTip.z - indexTip.z;

    return Math.sqrt(dx * dx + dy * dy + dz * dz);
};
