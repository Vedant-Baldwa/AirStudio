import { AudioEngine } from '../audio/audioEngine';
import { GuitarModule } from './GuitarModule';
import { DrumModule } from './DrumModule';
import { PianoModule } from './PianoModule';
import { ViolinModule } from './ViolinModule';
import { HandData } from '../hooks/useHandTracking';

export type InstrumentName = 'guitar' | 'drums' | 'piano' | 'violin';

export class InstrumentManager {
    private activeInstrumentType: InstrumentName = 'guitar';

    // Modules
    private guitar: GuitarModule;
    private drums: DrumModule;
    private piano: PianoModule;
    private violin: ViolinModule;

    constructor(audioEngine: AudioEngine) {
        this.guitar = new GuitarModule(audioEngine);
        this.drums = new DrumModule(audioEngine);
        this.piano = new PianoModule(audioEngine);
        this.violin = new ViolinModule(audioEngine);
    }

    public processFrame(leftHand: HandData | null, rightHand: HandData | null) {
        if (this.activeInstrumentType === 'guitar') {
            this.guitar.processFrame(leftHand, rightHand);
        } else if (this.activeInstrumentType === 'drums') {
            this.drums.processFrame(leftHand, rightHand);
        } else if (this.activeInstrumentType === 'piano') {
            this.piano.processFrame(leftHand, rightHand);
        } else if (this.activeInstrumentType === 'violin') {
            this.violin.processFrame(leftHand, rightHand);
        }
    }

    public switchTo(instrument: InstrumentName) {
        this.activeInstrumentType = instrument;
    }

    public getActiveInstrument() {
        return this.activeInstrumentType;
    }

    // Expose state getters for UI/AR rendering
    public getGuitarState() {
        return { chord: this.guitar.getCurrentChord() };
    }

    public getDrumState() {
        return { zones: this.drums.getActiveZones() };
    }

    public getPianoState() {
        return { keys: this.piano.getActiveKeys() };
    }

    public getViolinState() {
        return this.violin.getActiveState();
    }
}
