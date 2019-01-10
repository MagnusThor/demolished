;
import { ShaderEntity} from './demolishedEntity'

export class RenderTarget {
    constructor(public frameBuffer: WebGLFramebuffer, public renderBuffer: WebGLFramebuffer,
        public texture: WebGLTexture) { }
}
export interface IGraph{
    audioSettings: any;
    effects: Array<Effect>;
    name: string;
    timeline: Array<TimeFragment>;    
    shared:any,
    duration:number
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
    duration: number;
    timeline: Array<TimeFragment>;
    shared:any;
}
/**
 * 
 * 
 * @export
 * @class TimeFragment
 */
export class TimeFragment {
    entityShader: ShaderEntity;
    subeffects:Array<number> 
    private _subeffects:Array<number>;
    constructor(public entity: string, public start: number, public stop: number,
        subeffects?: Array<number>) {
            subeffects ? this.subeffects = subeffects : this.subeffects = new Array<number>();
            this._subeffects = this.subeffects.map( (a) => {return a});   
    }
    reset(){
        this.subeffects = this._subeffects.map( (a) => {return a});
    }
    setEntity(ent: ShaderEntity) {
        this.entityShader = ent;
    }
    init(){
        try{
        this.subeffects.forEach ( (interval:number) => {
            let shader = this.entityShader;
            shader.addAction("$subeffects", (ent:ShaderEntity,tm:number) =>{
                if(this.subeffects.find( (a:number) => { return a <= tm })){
                    ent.subEffectId++;
                    this.subeffects.shift();            
                }
            });
        });
    }catch(err){
        console.warn(err);
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
            constructor(audioFile?:string,audioAnalyzerSettings?:AudioAnalyzerSettings,duration?:number,
            bpm?:number){
                this.audioAnalyzerSettings = audioAnalyzerSettings;
                this.bpm = bpm;
                this.audioFile;
                this.duration = duration;
            }
}