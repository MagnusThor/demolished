;
import { EnityBase} from './demolishedEntity'

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
    entityShader: EnityBase;
    css3Layers: Array<CSS3Layer>;
    constructor(public entity: string, public start: number, public stop: number,
     css3Layers?:Array<CSS3Layer>
    ) {
        if(css3Layers instanceof Array) {
            this.css3Layers = css3Layers;}
            else this.css3Layers = new Array<CSS3Layer>();
    }
    setEntity(ent: EnityBase) {
        this.entityShader = ent;
    }
    get hasLayers() {
            return this.css3Layers.length > 0;
    }
}

export class CSS3Layer{
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