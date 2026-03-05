import React, { useEffect } from 'react';
import { NormalizedLandmarkList } from '@mediapipe/hands';
import { HandData } from '../hooks/useHandTracking';
import { HAND_CONNECTIONS } from '../cv/handTracking';
import { drawGuitarFrets } from './drawGuitar';
import { drawDrumZones } from './drawDrums';
import { drawPianoKeys } from './drawPiano';
import { drawViolinStrings } from './drawViolin';

interface AROverlayProps {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    leftHand: HandData | null;
    rightHand: HandData | null;
    activeInstrument?: string;
    activeChord?: string | null;
    activeDrumZones?: string[];
    activePianoKeys?: string[];
    violinPlaying?: boolean;
}

const drawHandSkeleton = (ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmarkList, color: string) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    ctx.strokeStyle = color;
    ctx.lineWidth = 3;

    // Draw connections
    HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];

        ctx.beginPath();
        ctx.moveTo(start.x * width, start.y * height);
        ctx.lineTo(end.x * width, end.y * height);
        ctx.stroke();
    });

    // Draw points
    ctx.fillStyle = '#FFFFFF';
    landmarks.forEach(landmark => {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
};

export const AROverlay: React.FC<AROverlayProps> = ({
    canvasRef,
    leftHand,
    rightHand,
    activeInstrument = 'guitar',
    activeChord = null,
    activeDrumZones = [],
    activePianoKeys = [],
    violinPlaying = false
}) => {
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear previous frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Render underlying Instrument HUDs
        if (activeInstrument === 'drums') {
            drawDrumZones(ctx, activeDrumZones);
        }

        if (activeInstrument === 'piano') {
            drawPianoKeys(ctx, activePianoKeys);
        }

        if (activeInstrument === 'violin') {
            drawViolinStrings(ctx, leftHand?.landmarks || null, violinPlaying);
        }

        if (activeInstrument === 'guitar') {
            drawGuitarFrets(ctx, leftHand?.landmarks || null, activeChord);
        }

        // Hand Skeleton overlays
        if (leftHand) {
            drawHandSkeleton(ctx, leftHand.landmarks, '#00E5FF'); // Cyan for left hand
        }

        if (rightHand) {
            drawHandSkeleton(ctx, rightHand.landmarks, '#A78BFA'); // Purple for right hand
        }

    }, [canvasRef, leftHand, rightHand, activeInstrument, activeChord, activeDrumZones]);

    return null; // Renders on the provided canvas ref
};
