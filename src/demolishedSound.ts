
import loadResource from "./demolishedLoader";
/**
 * 
 * 
 * @export
 * @class DemolishedSoundBase
 */
export class DemolishedSoundBase {
    audioAnalyser: AnalyserNode
    audio: any;
    constructor() { }
}

/**
 * 
 * 
 * @export
 * @interface IDemolisedAudioContext
 */
export interface IDemolisedAudioContext {
    createAudio(settings: any): Promise<boolean>
    play(tm?: number): void
    stop(tm?: number): void
    currentTime: number;
    getFrequenceData(): Uint8Array
    textureSize: number 

}
declare var SIDBackendAdapter: any;

/**
 * 
 * 
 * @export
 * @class DemolishedSIDMusic
 * @extends {DemolishedSoundBase}
 * @implements {IDemolisedAudioContext}
 */
export class DemolishedSIDMusic extends DemolishedSoundBase implements IDemolisedAudioContext {
    private sid: any;
    get textureSize(){
        return 16;
    }

    constructor() {
        super();
    }
    play() {
        this.sid.play();
    }
    stop() {
        this.sid.pause();
    }
    getFrequenceData():Uint8Array {
        return this.sid.getFreqByteData();
    }

    get currentTime(): number {
        return this.sid._currentPlaytime;
    }
    set currentTime(n: number) {
       return;
    }   

    createAudio(settings:any): Promise<boolean> {
        const useLess = ()=> {};
        let ScriptNodePlayer = window["ScriptNodePlayer"];
        let self = this;
        return new Promise(function (resolve, reject) {
            ScriptNodePlayer.createInstance(new SIDBackendAdapter(), "", [], true, useLess, function () {
                self.sid = this;
                resolve(true);
            },useLess, useLess);
            ScriptNodePlayer.getInstance().loadMusicFromURL(settings.audioFile, {
                basePath: ""
            }, useLess, useLess);
        });
    }
}
/**
 * 
 * 
 * @export
 * @class DemolishedStreamingMusic
 * @extends {DemolishedSoundBase}
 * @implements {IDemolisedAudioContext}
 */
export class DemolishedStreamingMusic extends DemolishedSoundBase implements IDemolisedAudioContext {
    constructor() {
        super();
    }
    get textureSize(){
        return 32;
    }
    getFrequenceData():Uint8Array {
        let bufferLength =  this.audioAnalyser.frequencyBinCount;;
        let freqArray = new Uint8Array(bufferLength);
        this.audioAnalyser.getByteFrequencyData(freqArray)
        return freqArray;
    }

    play() {
        this.audio.play();
    }
    stop() {
        this.audio.stop();
    }
    get currentTime(): number {
        return this.audio.currentTime;
    }
    set currentTime(time: number) {
        this.audio.currentTime = time;
    }

    createAudio(audioSettings: any): Promise<boolean> {
        return new Promise((resolve, reject) => {
            loadResource(audioSettings.audioFile).then((resp: Response) => {
                return resp.arrayBuffer().then((buffer: ArrayBuffer) => {
                    let audioCtx = new AudioContext();


                    console.log("streaming music loaded ",buffer);

                    audioCtx.decodeAudioData(buffer, (audioData: AudioBuffer) => {

                        let offlineCtx = new OfflineAudioContext(1, audioData.length, audioData.sampleRate);

                        var filteredSource = offlineCtx.createBufferSource();
                        filteredSource.buffer = audioData;                    // tell the source which sound to play
                        filteredSource.connect(offlineCtx.destination);       // connect the source to the context's destination (the speakers)

                        var filterOffline = offlineCtx.createBiquadFilter();
                        filterOffline.type = 'highpass';
                        filterOffline.Q.value = 2;
                        filterOffline.frequency.value = 2000;

                        // Pipe the song into the filter, and the filter into the offline context
                        filteredSource.connect(filterOffline);
                        filterOffline.connect(offlineCtx.destination);

                        filteredSource.start(0);

                        let source = audioCtx.createBufferSource(); // creates a sound source
                        source.buffer = audioData;                    // tell the source which sound to play
                        source.connect(audioCtx.destination);       // connect the source to the context's destination (the speakers)

                        offlineCtx.startRendering().then((renderedBuffer: AudioBuffer) => {
                            let audioCtx = new AudioContext();

                            let audioEl = new Audio();
                            audioEl.preload = "auto";
                            audioEl.src = audioSettings.audioFile;
                            audioEl.crossOrigin = "anonymous"

                            const onLoad = () => {
                                let source = audioCtx.createMediaElementSource(audioEl);
                                let analyser = audioCtx.createAnalyser();
                                analyser.smoothingTimeConstant = audioSettings.audioAnalyzerSettings.smoothingTimeConstant;
                                analyser.fftSize = audioSettings.audioAnalyzerSettings.fftSize
                                
                                //  analyser.maxDecibels = audioSettings.audioAnalyzerSettings.maxDecibels
                                //  analyser.minDecibels = audioSettings.audioAnalyzerSettings.minDecibels;
                    
                                this.audio = audioEl;
                                source.connect(analyser);
                                analyser.connect(audioCtx.destination);
                                this.audioAnalyser = analyser;
                                resolve(true)
                                window.addEventListener("load", onLoad, false);
                            };
                            onLoad();

                            let bufferSource = audioCtx.createBufferSource();
                            bufferSource.buffer = renderedBuffer;

                        });
                    });
                });
            });
        });
    }
}
