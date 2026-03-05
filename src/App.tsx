import React, { useRef, useEffect, useMemo } from 'react';
import { useWebcam } from './hooks/useWebcam';
import { useHandTracking } from './hooks/useHandTracking';
import { useAudioEngine } from './hooks/useAudioEngine';
import { AROverlay } from './ar/AROverlay';
import { InstrumentManager, InstrumentName } from './instruments/instrumentManager';
import { GestureClassifier } from './gestures/gestureClassifier';

const App: React.FC = () => {
  const { videoRef, isReady: webcamReady, error } = useWebcam();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { leftHand, rightHand, isTracking } = useHandTracking(videoRef, webcamReady);
  const { audioEngine, isReady: audioReady, initAudio } = useAudioEngine();

  // Initialize instruments once engine exists
  const instrumentManager = useMemo(() => new InstrumentManager(audioEngine), [audioEngine]);
  const gestureClassifier = useMemo(() => new GestureClassifier(), []);

  // Frame processing loop
  useEffect(() => {
    if (!audioReady) return;

    // Command Mode triggered if only LEFT hand is visible and held high/still
    // For MVP robustness, let's use a double-pinch or specific gesture on the left hand.
    // Instead of full state matching, we'll constantly poll the left hand:
    if (leftHand && !rightHand) {
      const instrumentPrediction = gestureClassifier.predictInstrument(leftHand.landmarks);
      if (instrumentPrediction !== 'unknown') {
        instrumentManager.switchTo(instrumentPrediction as InstrumentName);
      }
    }

    instrumentManager.processFrame(leftHand, rightHand);
  }, [leftHand, rightHand, audioReady, instrumentManager, gestureClassifier]);

  // Active state for HUD
  const activeInstrument = instrumentManager.getActiveInstrument();
  const guitarState = instrumentManager.getGuitarState();
  const drumState = instrumentManager.getDrumState();
  const pianoState = instrumentManager.getPianoState();
  const violinState = instrumentManager.getViolinState();

  // Set canvas size to match window for full screen
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-screen h-screen bg-[#0A0C10] overflow-hidden flex flex-col items-center justify-center">
      {error && (
        <div className="absolute top-4 bg-red-500 text-white px-4 py-2 rounded-md z-50">
          Error: {error}
        </div>
      )}

      {!webcamReady && !error && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-20 bg-[#0A0C10]">
          Loading Webcam...
        </div>
      )}

      {/* Initialize Audio Screen Overlay */}
      {webcamReady && !audioReady && (
        <div className="absolute inset-0 flex items-center justify-center text-white z-30 bg-[#0A0C10]/80 backdrop-blur-sm">
          <button
            onClick={initAudio}
            className="px-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xl rounded-full shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all transform hover:scale-105"
          >
            Start AirStudio
          </button>
        </div>
      )}

      {/* Mirrored Webcam feed directly rendered mapped to full screen */}
      <video
        ref={videoRef}
        playsInline
        className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-0"
      />

      {/* AR Canvas Overlay */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10 pointer-events-none -scale-x-100"
      />
      <AROverlay
        canvasRef={canvasRef}
        leftHand={leftHand}
        rightHand={rightHand}
        activeInstrument={activeInstrument}
        activeChord={guitarState.chord}
        activeDrumZones={drumState.zones}
        activePianoKeys={pianoState.keys}
        violinPlaying={violinState.isPlaying}
      />

      {/* Development Debug Info */}
      <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-md text-white px-4 py-3 rounded-xl border border-gray-700/50 shadow-lg z-20 text-xs font-mono">
        <div>Tracking: <span className={isTracking ? 'text-green-400' : 'text-red-400'}>{isTracking ? 'ACTIVE' : 'INACTIVE'}</span></div>
        <div className="mt-1 flex items-center gap-2">
          Left Hand Chord: <span className="text-cyan-400 font-bold">{guitarState.chord || 'NONE'}</span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          Piano Keys: <span className="text-cyan-400 font-bold">{pianoState.keys.length > 0 ? pianoState.keys.join(',') : 'NONE'}</span>
        </div>
        <div className="mt-1">Right Hand State: {rightHand ? 'READY TO STRUM' : 'NONE'}</div>
        <div className="mt-1">Audio Engine: <span className={audioReady ? 'text-green-400' : 'text-red-400'}>{audioReady ? 'LOADED' : 'WAITING'}</span></div>

        {/* DEV ONLY TEMPORARY INSTRUMENT SWITCHER */}
        <div className="mt-3 border-t border-gray-700 pt-2 pb-1">Test Switch:</div>
        <div className="flex gap-2">
          <button className="px-2 py-1 bg-gray-700 rounded text-yellow-400 hover:bg-gray-600" onClick={() => instrumentManager.switchTo('guitar')}>Guitar</button>
          <button className="px-2 py-1 bg-gray-700 rounded text-cyan-400 hover:bg-gray-600" onClick={() => instrumentManager.switchTo('drums')}>Drums</button>
          <button className="px-2 py-1 bg-gray-700 rounded text-pink-400 hover:bg-gray-600" onClick={() => instrumentManager.switchTo('piano')}>Piano</button>
          <button className="px-2 py-1 bg-gray-700 rounded text-orange-400 hover:bg-gray-600" onClick={() => instrumentManager.switchTo('violin')}>Violin</button>
        </div>
      </div>

      {/* Mode Switcher HUD (Top Center) */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-900/80 backdrop-blur-md px-6 py-2 rounded-full border border-gray-700/50 shadow-2xl z-20 flex gap-6 font-bold text-sm tracking-widest transition-colors duration-300">
        <div className={`${activeInstrument === 'guitar' ? 'text-yellow-400 scale-110' : 'text-gray-500'} transition-all`}>🎸 GUITAR</div>
        <div className={`${activeInstrument === 'drums' ? 'text-cyan-400 scale-110' : 'text-gray-500'} transition-all`}>🥁 DRUMS</div>
        <div className={`${activeInstrument === 'piano' ? 'text-pink-400 scale-110' : 'text-gray-500'} transition-all`}>🎹 PIANO</div>
        <div className={`${activeInstrument === 'violin' ? 'text-orange-400 scale-110' : 'text-gray-500'} transition-all`}>🎻 VIOLIN</div>
      </div>

      {/* Bottom HUD */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/80 backdrop-blur-md text-white px-6 py-3 rounded-2xl border border-gray-700/50 shadow-lg z-20 flex gap-4 max-w-lg w-full items-center justify-between">
        <h1 className="font-bold tracking-widest uppercase text-sm text-cyan-400">AirStudio</h1>
        <div className="font-medium text-sm">
          Active Instrument: <span className="text-white font-bold ml-1">Guitar</span>
        </div>
      </div>
    </div>
  );
};

export default App;
