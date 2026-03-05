import { PianoKey, PIANO_LAYOUT } from '../instruments/PianoModule';

export const drawPianoKeys = (ctx: CanvasRenderingContext2D, activeKeys: string[]) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;

    // Keyboard UI Area
    const kbY = height * 0.82;
    const kbHeight = height * 0.18;

    // Draw background panel
    ctx.fillStyle = '#0A0C10';
    ctx.fillRect(0, kbY, width, kbHeight);
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, kbY);
    ctx.lineTo(width, kbY);
    ctx.stroke();

    // Draw White Keys First
    PIANO_LAYOUT.filter(k => !k.isBlack).forEach(key => renderKey(ctx, key, activeKeys, width, kbY, kbHeight));

    // Draw Black Keys on Top
    PIANO_LAYOUT.filter(k => k.isBlack).forEach(key => renderKey(ctx, key, activeKeys, width, kbY, kbHeight * 0.6));
};

function renderKey(
    ctx: CanvasRenderingContext2D,
    key: PianoKey,
    activeKeys: string[],
    canvasWidth: number,
    y: number,
    h: number
) {
    const isPressed = activeKeys.includes(key.note);

    // Pixel Dimensions
    const px = key.xStart * canvasWidth;
    const pWidth = (key.xEnd - key.xStart) * canvasWidth;

    ctx.beginPath();

    // Slight gap between keys visually
    ctx.rect(px + 1, y, pWidth - 2, h);

    if (key.isBlack) {
        if (isPressed) {
            ctx.fillStyle = '#00B8D9'; // Bright cyan when pressed
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00B8D9';
        } else {
            ctx.fillStyle = '#1E293B'; // Slate 800
            ctx.shadowBlur = 0;
        }
        ctx.fill();

    } else {
        if (isPressed) {
            ctx.fillStyle = '#E2E8F0'; // Lighter gray when pressed
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#FFFFFF';
        } else {
            ctx.fillStyle = '#FFFFFF';
            ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.strokeStyle = '#94A3B8'; // Slate 400
        ctx.stroke();
    }

    ctx.shadowBlur = 0; // Reset
}
