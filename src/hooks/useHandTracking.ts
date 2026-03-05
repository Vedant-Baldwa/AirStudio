import { useEffect, useState } from 'react';
import { Results, NormalizedLandmarkList } from '@mediapipe/hands';
import { initHandTracking } from '../cv/handTracking';
import { getFingerExtension } from '../cv/landmarkUtils';

export interface HandData {
    landmarks: NormalizedLandmarkList;
    handedness: string;
    fingerExtensions: number[];
}

export const useHandTracking = (videoRef: React.RefObject<HTMLVideoElement>, isReady: boolean) => {
    const [leftHand, setLeftHand] = useState<HandData | null>(null);
    const [rightHand, setRightHand] = useState<HandData | null>(null);
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        if (!isReady || !videoRef.current) return;

        let trackingActive = true;

        const onResults = (results: Results) => {
            if (!trackingActive) return;

            if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                setIsTracking(true);
                console.log(`Detected ${results.multiHandLandmarks.length} hands. Landmarks mapping count per hand:`, results.multiHandLandmarks[0].length);

                let newLeft: HandData | null = null;
                let newRight: HandData | null = null;

                results.multiHandLandmarks.forEach((landmarks, index) => {
                    const handedness = results.multiHandedness[index].label.toLowerCase();
                    const fingerExtensions = [0, 1, 2, 3, 4].map(i => getFingerExtension(landmarks, i));

                    const handData: HandData = {
                        landmarks,
                        handedness,
                        fingerExtensions
                    };

                    // Since selfieMode is false, MediaPipe correctly labels the user's physical right hand as 'Right'
                    // because it assumes it's looking at a person facing the camera.
                    // We render it mirrored via CSS, so it appears natively as a mirror.
                    if (handedness === 'left') newLeft = handData;
                    else if (handedness === 'right') newRight = handData;
                });

                setLeftHand(newLeft);
                setRightHand(newRight);
            } else {
                setIsTracking(false);
                setLeftHand(null);
                setRightHand(null);
            }
        };

        const { hands, camera } = initHandTracking(videoRef.current, onResults);

        return () => {
            trackingActive = false;
            camera.stop();
            hands.close();
        };
    }, [isReady, videoRef]);

    return { leftHand, rightHand, isTracking };
};
