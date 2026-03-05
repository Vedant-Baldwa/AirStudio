import { NormalizedLandmarkList } from '@mediapipe/hands';

export const drawViolinStrings = (
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmarkList | null,
    isPlaying: boolean
) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // 4 strings mapping to specific X coordinate regions (mirrored coordinates naturally align)
    // X= 0.20 (G3), 0.30 (D4), 0.40 (A4), 0.50 (E5)
    const strings = [0.20, 0.30, 0.40, 0.50];

    ctx.lineWidth = 4;

    strings.forEach((strX, index) => {
        ctx.beginPath();
        const px = strX * width;
        ctx.moveTo(px, height * 0.1);
        ctx.lineTo(px, height * 0.9);

        // If playing, make strings glow orange/gold
        if (isPlaying) {
            ctx.strokeStyle = `rgba(250, 204, 21, ${1 - index * 0.1})`; // FACC15 Gold
            ctx.shadowColor = '#FACC15';
            ctx.shadowBlur = 10;
            ctx.stroke();
        } else {
            ctx.strokeStyle = `rgba(203, 213, 225, 0.4)`; // Slate 300
            ctx.shadowBlur = 0;
            ctx.stroke();
        }
    });

    // Highlight finger position if hand is visible
    if (landmarks) {
        const finger = landmarks[8]; // index finger
        ctx.beginPath();
        ctx.arc(finger.x * width, finger.y * height, 12, 0, Math.PI * 2);
        ctx.fillStyle = isPlaying ? '#FACC15' : '#CBD5E1';
        ctx.fill();
        ctx.shadowBlur = 0;
    }
};
