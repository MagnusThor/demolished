export class AudioSettings {
    audioFile: string;
    duration: number;
    bmp: number;
    audioAnalyzerSettings: {
        fftSize: number;
        smoothingTimeConstant: number;
        minDecibels: number;
        maxDecibels: number;
    };
}
