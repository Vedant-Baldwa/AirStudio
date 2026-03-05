import { NormalizedLandmarkList } from '@mediapipe/hands';

export const drawGuitarFrets = (
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmarkList | null,
    activeChord: string | null
) => {
    if (!landmarks) return;

    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Draw 6 vertical laser "frets" down from the hand position to the bottom of screen
    const palm = landmarks[0]; // wrist
    const px = palm.x * width;
    const py = palm.y * height;

    ctx.shadowColor = '#00E5FF';
    ctx.shadowBlur = 10;
    ctx.lineWidth = 2;

    for (let i = 0; i < 6; i++) {
        const stringOffset = (i - 2.5) * 40; // Spaced evenly by 40px
        ctx.beginPath();
        // Use scaleX(-1) logic on X offsets if needed, but since we map directly to unmirrored LM values, it is fine
        ctx.moveTo(px + stringOffset, py);

        // Fade strings downward
        const gradient = ctx.createLinearGradient(0, py, 0, height);
        gradient.addColorStop(0, 'rgba(0, 229, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.strokeStyle = gradient;

        ctx.lineTo(px + stringOffset, height);
        ctx.stroke();
    }

    // Draw active chord text locked to upper left of the hand
    if (activeChord) {
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#FACC15'; // Gold
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'right'; // Drawing to left of Hand center

        ctx.save();
        ctx.translate(px, py - 60);
        ctx.scale(-1, 1); // un-mirror text
        ctx.fillText(activeChord, 0, 0);
        ctx.restore();
    }
};
