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
export class Uniforms implements IUniforms{
    time: number;
    get datetime():Array<number>{
        let d = new Date();
        return [ d.getFullYear(),d.getMonth(),d.getDate(),
            d.getHours()*60.0*60 + d.getMinutes()*60 + d.getSeconds()  + d.getMilliseconds()/1000.0 ];
       }
    timeTotal: number
    mouseX: number;
    mouseY: number;
    screenWidth: number;
    screenHeight: number;
    alpha:number;
    constructor(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.alpha = 0;
        this.time = 0;
        this.timeTotal = 0;
        this.mouseX = 0.5;
        this.mouseY = 0.5;
      

    }
    setScreen(w: number, h: number) {
        this.screenWidth = w;
        this.screenWidth = h;
    }
}

export interface IUniforms{
    time:number;
    datetime:Array<number>;
    timeTotal:number;
    screenWidth:number;
    screenHeight: number;
    mouseX:number;
    mouseY:number;
    setScreen(w:number,height:number)
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
