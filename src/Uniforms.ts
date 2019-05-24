import { PiplelineHandler } from "./Pipleline";
import { IEntityTexture } from "./demolishedEntity";

/*
export const _GLType = {
    'FLOAT': 'float',
    'FLOAT_VEC2': 'vec2',
    'FLOAT_VEC3': 'vec3',
    'FLOAT_VEC4': 'vec4',
    'INT': 'int',
    'INT_VEC2': 'ivec2',
    'INT_VEC3': 'ivec3',
    'INT_VEC4': 'ivec4',
    'BOOL': 'bool',
    'BOOL_VEC2': 'bvec2',
    'BOOL_VEC3': 'bvec3',
    'BOOL_VEC4': 'bvec4',
    'FLOAT_MAT2': 'mat2',
    'FLOAT_MAT3': 'mat3',
    'FLOAT_MAT4': 'mat4',
    'SAMPLER_2D': 'sampler2D',
    'SAMPLER_CUBE': 'samplerCube'
}
*/

export interface IUniforms {
    time: number;
    datetime: Array<number>;
    timeTotal: number;
    screenWidth: number;
    screenHeight: number;
    mouse: Array<number>;
    setScreen(w: number, height: number):void
    createPipleline(gl: WebGLRenderingContext): Uniforms;
}

export class UniformsBase {

    GLType = [
        {
            ut:  -1,
            mi: 'N',
            un: 'bool'
        },
        {
            ut:  5126,
            mi: 'f',
            un: 'float'
        },
        {
            ut:  -1,
            mi: 'i',
            un: 'float'
        },
        {
            ut:  35664,
            mi: 'f',
            un: 'vec2'
        },
        {
            ut:  -1,
            mi: 'f',
            un: 'vec3'
        },
        {
            ut:  -1,
            mi: 'f',
            un: 'vec4'
        },      
        {
            ut:  -1, //35678,
            mi: 'updateTexture',
            un: 'sampler2D'
        },      
    ]
    
    /**
     *  find type by GL datatype 
     *
     * @param {number} gltype
     * @returns {*}
     * @memberof UniformsBase
     */
    findType(gltype:number):any{
        return this.GLType.find( (pre:any) => pre.ut == gltype);
    }
   // static handler: PiplelineHandler<Uniforms>;
    handler!: PiplelineHandler<Uniforms>;
    //static uniformCache: Map<string, WebGLUniformLocation>;
    uniformCache: Map<string, WebGLUniformLocation>;
    activeUniforms: Array<any>; // todo define class.
    
    constructor(public gl: WebGLRenderingContext,public program:WebGLProgram) {
        this.uniformCache = new Map<string,WebGLUniformLocation>();
        this.activeUniforms = this.runtimeUniforms();
    }
    runtimeUniforms():Array<any> {
        let numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS)
        const result = []
        
        for (let i = 0; i < numUniforms; ++i) {
            let info = this.gl.getActiveUniform(this.program, i)
            if (info) {
                result.push({
                            type:info.type,
                            name:info.name});                
            }
        }
        
        return result;
    } 
    cacheUniformLocation(label: string): UniformsBase {
        this.uniformCache.set(label, this.gl.getUniformLocation(this.program, label));  
        return this;
    }
    location(key:PropertyKey):WebGLUniformLocation{   
        return this.uniformCache.get(key.toString());
    }    
    mapType(value: any,au:any): any {
     
        let prefix = "uniform";
        let mi = "", 
        dt =  this.findType(au.type), 
        s = "1";
        let args = [];
        if(!Array.isArray(value)){
            args.push(value);
        } else
            args = value;
            s = args.length.toString();      
        
            mi = prefix + s + dt.mi;  
        return {
            mi,
            args
        }; 
    }
    /**
     *
     *
     * @returns {Uniforms}
     * @memberof UniformsBase
     */
    createPipleline(): Uniforms{
        this.handler = new PiplelineHandler<Uniforms>();
      
        return new Proxy<Uniforms>(new Uniforms(this.gl,this.program), this.handler);
    }
}
/**
 * Uniforms are global variables passed to the shaders program's
 *
 * @export
 * @class Uniforms
 */
export class Uniforms extends UniformsBase {
    get datetime(): Array<number> {
        let d = new Date();
        return [d.getFullYear(), d.getMonth(), d.getDate(),
        d.getHours() * 60.0 * 60 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000.0];
    }
    textures?: Map<string,IEntityTexture>;
    time: number;
    timeTotal: number;
    mouse: Array<number>;
    resolution: Array<number>;
    get screenWidth(): number {
        return this.resolution[0];
    }
    get screenHeight(): number {
        return this.resolution[1];
    }
    alpha: number;
    textureIndex: number = 2;
    constructor(gl: WebGLRenderingContext, public program: WebGLProgram) {
        super(gl, program);
        this.time = 0; // float
        this.timeTotal = 0; // float
        this.mouse = [0.5, 0.5]; // vec2;
        this.resolution = [gl.canvas.width, gl.canvas.height]; // vec2:
        this.textures = new Map<string,IEntityTexture>();
    }
    setScreen(w: number, h: number) {
        this.resolution = [w, h]; // vec2;
    }
    bindTexture(key:string){

    }
}
