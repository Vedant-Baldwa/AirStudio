import * as Tone from 'tone';

// Using free open-source guitar/piano samples via Tonejs/Tone.js gh-pages
const SAMPLES_BASE_URL = 'https://tonejs.github.io/audio/salamander/';

export const loadGuitarSampler = (): Promise<Tone.Sampler> => {
    return new Promise((resolve) => {
        const sampler = new Tone.Sampler({
            urls: {
                A0: "A0.mp3",
                C1: "C1.mp3",
                "D#1": "Ds1.mp3",
                "F#1": "Fs1.mp3",
                A1: "A1.mp3",
                C2: "C2.mp3",
                "D#2": "Ds2.mp3",
                "F#2": "Fs2.mp3",
                A2: "A2.mp3",
                C3: "C3.mp3",
                "D#3": "Ds3.mp3",
                "F#3": "Fs3.mp3",
                A3: "A3.mp3",
                C4: "C4.mp3",
                "D#4": "Ds4.mp3",
                "F#4": "Fs4.mp3",
                A4: "A4.mp3",
                C5: "C5.mp3",
                "D#5": "Ds5.mp3",
                "F#5": "Fs5.mp3",
                A5: "A5.mp3",
                C6: "C6.mp3",
                "D#6": "Ds6.mp3",
                "F#6": "Fs6.mp3",
                A6: "A6.mp3",
                C7: "C7.mp3",
                "D#7": "Ds7.mp3",
                "F#7": "Fs7.mp3",
                A7: "A7.mp3",
                C8: "C8.mp3"
            },
            baseUrl: SAMPLES_BASE_URL,
            onload: () => {
                resolve(sampler);
            }
        });
    });
};

export const loadPianoSampler = (): Promise<Tone.Sampler> => {
    return new Promise((resolve) => {
        const sampler = new Tone.Sampler({
            urls: {
                A0: "A0.mp3",
                C1: "C1.mp3",
                "D#1": "Ds1.mp3",
                "F#1": "Fs1.mp3",
                A1: "A1.mp3",
                C2: "C2.mp3",
                "D#2": "Ds2.mp3",
                "F#2": "Fs2.mp3",
                A2: "A2.mp3",
                C3: "C3.mp3",
                "D#3": "Ds3.mp3",
                "F#3": "Fs3.mp3",
                A3: "A3.mp3",
                C4: "C4.mp3",
                "D#4": "Ds4.mp3",
                "F#4": "Fs4.mp3",
                A4: "A4.mp3",
                C5: "C5.mp3",
                "D#5": "Ds5.mp3",
                "F#5": "Fs5.mp3",
                A5: "A5.mp3",
                C6: "C6.mp3",
                "D#6": "Ds6.mp3",
                "F#6": "Fs6.mp3",
                A6: "A6.mp3",
                C7: "C7.mp3",
                "D#7": "Ds7.mp3",
                "F#7": "Fs7.mp3",
                A7: "A7.mp3",
                C8: "C8.mp3"
            },
            baseUrl: SAMPLES_BASE_URL,
            onload: () => {
                resolve(sampler);
            }
        });
    });
};

export const loadDrumSampler = (): any => {
    // Placeholder synth for kick/snare fallbacks for drums MVP
    const kick = new Tone.MembraneSynth().toDestination();
    const snare = new Tone.NoiseSynth().toDestination();
    const hihat = new Tone.MetalSynth().toDestination();

    return {
        triggerAttackRelease: (note: string, duration: string, time: any, velocity: number) => {
            if (note === 'C1') kick.triggerAttackRelease('C1', duration, time, velocity);
            if (note === 'D1') snare.triggerAttackRelease(duration, time, velocity);
            if (note === 'F#1') hihat.triggerAttackRelease(duration, time, velocity);
        }
    };
};

export const loadViolinSampler = (): any => {
    // Violin is mapped to a continuous Synth with heavy processing rather than discrete samples
    return new Tone.FMSynth({
        harmonicity: 3.01,
        modulationIndex: 14,
        oscillator: {
            type: "triangle"
        },
        envelope: {
            attack: 0.2,
            decay: 0.3,
            sustain: 1,
            release: 1.2
        },
        modulation: {
            type: "square"
        },
        modulationEnvelope: {
            attack: 0.01,
            decay: 0.5,
            sustain: 0.2,
            release: 0.1
        }
    }).toDestination();
};
