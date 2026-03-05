import { Hands, Results, HAND_CONNECTIONS } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

export const initHandTracking = (
    videoEl: HTMLVideoElement,
    onResults: (results: Results) => void
) => {
    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.5,
    } as any);

    // setOptions 'selfieMode' workaround based on types
    (hands as any).setOptions({
        selfieMode: false,
    });

    hands.onResults(onResults);

    const camera = new Camera(videoEl, {
        onFrame: async () => {
            await hands.send({ image: videoEl });
        },
        width: 1280,
        height: 720
    });

    camera.start();

    return { hands, camera };
};

export { HAND_CONNECTIONS };
