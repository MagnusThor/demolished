export declare class DemolishedRecorder {
    videoTrack: MediaStreamTrack;
    audioTrack: MediaStreamTrack;
    data: Array<Blob>;
    recorder: any;
    mediaStream: MediaStream;
    constructor(videoTrack: MediaStreamTrack, audioTrack: MediaStreamTrack);
    stop(): void;
    start(n: number): void;
}
