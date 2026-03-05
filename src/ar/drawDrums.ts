import { getDrumZones } from '../instruments/DrumModule';

export const drawDrumZones = (ctx: CanvasRenderingContext2D, activeZones: string[]) => {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const zones = getDrumZones();

    zones.forEach(zone => {
        const isHit = activeZones.includes(zone.name);

        // Pixel coordinates
        const px = zone.xMin * width;
        const py = zone.yMin * height;
        const pWidth = (zone.xMax - zone.xMin) * width;
        const pHeight = (zone.yMax - zone.yMin) * height;

        // Drawing box
        ctx.beginPath();
        ctx.roundRect(px, py, pWidth, pHeight, 15);

        if (isHit) {
            ctx.fillStyle = 'rgba(0, 229, 255, 0.4)'; // Bright Cyan Hit
            ctx.strokeStyle = '#00E5FF';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#00E5FF';
            ctx.shadowBlur = 20;
        } else {
            ctx.fillStyle = 'rgba(15, 23, 42, 0.3)'; // Dark resting UI
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0;
        }

        ctx.fill();
        ctx.stroke();

        // Reset shadow for text
        ctx.shadowBlur = 0;

        // Draw Label text
        ctx.fillStyle = isHit ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Reverse text mirroring so it's readable because we scaleX(-1) the canvas!
        ctx.save();
        ctx.translate(px + pWidth / 2, py + pHeight / 2);
        ctx.scale(-1, 1);
        ctx.fillText(zone.name, 0, 0);
        ctx.restore();
    });
};
