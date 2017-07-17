;
import { EntityBase} from './demolishedEntity'
import { DemloshedTransitionBase } from "./demolishedTransitions";

export class RenderTarget {
    constructor(public frameBuffer: WebGLFramebuffer, public renderBuffer: WebGLFramebuffer,
        public texture: WebGLTexture) { }
}
/**
 * 
 * 
 * @export
 * @class Graph
 */
export class Graph {
    audioSettings: any;
    effects: Array<Effect>;
    name: string;
    timeline: Array<TimeFragment>;
}
/**
 * 
 * 
 * @export
 * @class TimeFragment
 */
export class TimeFragment {

    entityShader: EntityBase;
    overlays: Array<Overlay>; // overlays
    useTransitions: boolean
    transition: DemloshedTransitionBase;

    constructor(public entity: string, public start: number, public stop: number,
    useTransitions: boolean,
     overlays?:Array<Overlay>,
    ) {
        this.useTransitions = useTransitions;
        if(overlays instanceof Array) {
            this.overlays = overlays;}
            else this.overlays = new Array<Overlay>();
    }
    setEntity(ent: EntityBase) {
        this.entityShader = ent;
         if(this.useTransitions){

                this.transition = new DemloshedTransitionBase(this.entityShader);
        }
    }
    get hasLayers() {
            return this.overlays.length > 0;
    }
}

export class Overlay{
        markup:string
        constructor(public name:string,public classList: Array<string>){
        }
}
/**
 * Uniforms are global variables  passed to the shaders program's 
 * 
 * @export
 * @class Uniforms
 */
export class Uniforms {
    time: number;
    mouseX: number;
    mouseY: number;
    screenWidth: number;
    screenHeight: number;

    alpha:number;
    
    bpm: number;
    freq: number;

    constructor(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;
    }
    setScreen(w: number, h: number) {
        this.screenWidth = w;
        this.screenWidth = h;
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
    constructor() {
        this.textures = new Array<any>();
        this.type = 0;
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
export class AudioSettings{
            audioFile:string;
            audioAnalyzerSettings: AudioAnalyzerSettings
            duration:number;
            bpm: number
            constructor(){

            }
}


    //  "audioSettings": {
    //     "audioFile": "song.mp3",
    //     "audioAnalyzerSettings":{
    //         "fftSize": 8192,
    //         "smoothingTimeConstant": 0.85,
    //         "minDecibels": -100,
    //         "maxDecibels":-30
    //     },
       
    //     "duration": 211200,
    //     "bmp": 129
    // }