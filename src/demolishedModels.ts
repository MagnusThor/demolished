;
import { ShaderEntity} from './demolishedEntity'
import { DemlolishedTransitionBase } from "./demolishedTransitions";
import { Observe } from './demolishedProperties';

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
    entityShader: ShaderEntity;
    useTransitions: boolean
    transition: DemlolishedTransitionBase;
    constructor(public entity: string, public start: number, public stop: number,
    useTransitions: boolean) {
        this.useTransitions = useTransitions;
    }
    setEntity(ent: ShaderEntity) {
        this.entityShader = ent;
         if(this.useTransitions){

                this.transition = new DemlolishedTransitionBase(this.entityShader);
        }
    }
}
/**
 * Uniforms are global variables passed to the shaders program's 
 * 
 * @export
 * @class Uniforms
 */
export class Uniforms {
    @Observe(true)
    time: number;
    @Observe(true)
    timeTotal: number
    @Observe(true)
    mouseX: number;
    @Observe(true)
    mouseY: number;
    @Observe(true)
    screenWidth: number;
    @Observe(true)
    screenHeight: number;
    @Observe(true)    
    alpha:number;
    constructor(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.alpha = 0;
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
  */ export class AudioAnalyzerSettings {
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
