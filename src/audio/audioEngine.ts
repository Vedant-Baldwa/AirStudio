import * as Tone from 'tone';
import { loadGuitarSampler, loadDrumSampler, loadPianoSampler, loadViolinSampler } from './samplers';

export class AudioEngine {
    private isInitialized = false;
    private samplers: Record<string, any> = {};

    private compressor!: Tone.Compressor;
    private reverb!: Tone.Reverb;
    private limiter!: Tone.Limiter;

    public async init() {
        if (this.isInitialized) return;

        await Tone.start();

        // Setup Master Effects Chain
        this.compressor = new Tone.Compressor(-20, 4);
        this.reverb = new Tone.Reverb({ decay: 1.2, wet: 0.15 });
        this.limiter = new Tone.Limiter(-3);

        Tone.Destination.chain(this.compressor, this.reverb, this.limiter);

        // Initialize all samplers and route them through the fx chain
        const guitarSampler = await loadGuitarSampler();
        const pianoSampler = await loadPianoSampler();
        const violinSampler = await loadViolinSampler();

        guitarSampler.connect(this.compressor);
        pianoSampler.connect(this.compressor);
        violinSampler.connect(this.compressor);

        this.samplers = {
            guitar: guitarSampler,
            piano: pianoSampler,
            drums: loadDrumSampler(),
            violin: violinSampler
        };

        this.isInitialized = true;
    }

    public get isLoaded() {
        return this.isInitialized;
    }

    public playNote(instrument: string, note: string, velocity: number = 0.8, duration: string = '8n', timeOffset: number = 0) {
        if (!this.isInitialized) return;
        const sampler = this.samplers[instrument];
        if (sampler) {
            sampler.triggerAttackRelease(note, duration, Tone.now() + timeOffset, velocity);
        }
    }

    public startNote(instrument: string, note: string, velocity: number = 0.8) {
        if (!this.isInitialized) return;
        const sampler = this.samplers[instrument];
        if (sampler && sampler.triggerAttack) {
            sampler.triggerAttack(note, Tone.now(), velocity);
        }
    }

    public stopNote(instrument: string, note: string) {
        if (!this.isInitialized) return;
        const sampler = this.samplers[instrument];
        if (sampler && sampler.triggerRelease) {
            sampler.triggerRelease(note, Tone.now());
        }
    }
}

// Singleton pattern for the engine instance
export const engine = new AudioEngine();
