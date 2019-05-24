;
import { ShaderEntity } from './demolishedEntity'

export class RenderTarget {
    constructor(public frameBuffer: WebGLFramebuffer, public renderBuffer: WebGLFramebuffer,
        public texture: WebGLTexture) { }
}
export interface IGraph {
    audioSettings: any;
    effects: Array<Effect>;
    name: string;
    timeline: Array<ShaderEntity>;
    shared: any,
    duration: number
}
/**
 * 
 * 
 * @export
 * @class TimeFragment
 */
export class TimeFragment {
    subeffects: Array<number>
    private _subeffects: Array<number>;
    constructor(public entity: string, public start: number, public stop: number,
        subeffects?: Array<number>) {
        subeffects ? this.subeffects = subeffects : this.subeffects = new Array<number>();
        this._subeffects = this.subeffects.map((a) => { return a });
    }
    reset() {
        this.subeffects = this._subeffects.map((a) => { return a });
    }
}
/**
 * 
 * 
 * @export
 * @class Effect
 */
export class Effect {
    name: string
    type: number
    textures: Array<any>;
    start:number;
    stop:number;
    constructor(start:number,stop:number) {
        this.textures = new Array<any>();
        this.type = 0;
        this.start = start;
        this.stop = stop;
    }
}
/**
 * 
 * 
 * @export
 * @class AudioAnalyzerSettings
 */
export class AudioAnalyzerSettings {
    constructor(public fftSize: number, public smoothingTimeConstant: number,
        public minDecibels: number, public maxDecibels: number,
    ) { }
}
/**
 * 
 * 
 * @export
 * @class AudioSettings
 */
export class AudioSettings {
    audioFile: string;
    audioAnalyzerSettings: AudioAnalyzerSettings
    duration: number;
    bpm: number
    constructor(audioAnalyzerSettings?: AudioAnalyzerSettings, duration?: number,
        bpm?: number) {
        this.audioAnalyzerSettings = audioAnalyzerSettings;
        this.bpm = bpm;
        this.audioFile;
        this.duration = duration;
    }
}