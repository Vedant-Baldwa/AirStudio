import { useState, useCallback } from 'react';
import { engine } from '../audio/audioEngine';

export const useAudioEngine = () => {
    const [isReady, setIsReady] = useState(false);

    const initAudio = useCallback(async () => {
        if (isReady) return;
        try {
            await engine.init();
            setIsReady(true);
            console.log('Audio engine initialized');
        } catch (err) {
            console.error('Failed to init audio engine', err);
        }
    }, [isReady]);

    return { audioEngine: engine, isReady, initAudio };
};
