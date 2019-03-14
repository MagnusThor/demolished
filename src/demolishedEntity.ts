import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect } from './demolishedModels'
import loadResource from './demolishedLoader'
import { Demolished } from './demolished';
import { ShaderCompiler } from './demolishedUtils';
/*
  "duration" :6250200,
    "audioSettings": {
        "audioFile": "assets/vol.mp3",
        "audioAnalyzerSettings": {
            "fftSize": 8192,
            "smoothingTimeConstant": 0.85,
            "minDecibels": -90,
            "maxDecibels": -10
        },
        "duration": 6250200,
        "bmp": 129
    }
*/export class  AudioSettings{
        audioFile:string;
        duration:number;
        bmp:number;
        audioAnalyzerSettings: {
            fftSize:number,
            smoothingTimeConstant:number,
            minDecibels: number,
            maxDecibels: number
        };
}

export class EntityTexture {
    texture: WebGLTexture;
    constructor(public image: any, public name: string, public width: number, public height: number, public assetType: number) { }
}
export interface IEntity {
    render(engine: Demolished.Rendering);
    onError(err: any): void;
    swapBuffers(): void;
    glProgram: WebGLProgram;
    textures?: Array<EntityTexture>;
    mainBuffer: WebGLBuffer;
    vertexPosition: number;
    positionAttribute: number;
    target: RenderTarget;
    backTarget: RenderTarget;
    uniformsCache: Map<string, WebGLUniformLocation>;
    subEffectId: number;
    frameId: number;
    actions: Map<string, (ent: ShaderEntity, tm: number) => void>;
    addAction(key: string, fn: (ent: ShaderEntity, tm: number) => void);
    runAction(key: string, tm: number);
    removeAction(key: string);
}
/**
 *  
 * 
 * @export
 * @class EntityBase
 */
export class EntityBase {
    glProgram: WebGLProgram
    uniformsCache: Map<string, WebGLUniformLocation>;
    actions: Map<string, (ent: ShaderEntity, tm: number) => void>;
    constructor(public gl: WebGLRenderingContext) {
        this.actions = new Map<string, (ent: ShaderEntity, tm: number) => void>();
    }
    cacheUniformLocation(label: string) {
        this.uniformsCache.set(label, this.gl.getUniformLocation(this.glProgram, label));
    }
}
/**
 * ShadShaderEntity represents an effects shader (fragment, vertex) and its base properties  
 * todo: Move more props to the EntityBase
 * implement multiple buffers buffers[]
 * @export
 * @class ShaderEntity
 * @extends {EntityBase}
 * @implements {IEntity}
 */
export class ShaderEntity extends EntityBase implements IEntity {
    vertexShader: string;
    fragmentShader: string
    alpha: number;
    mainBuffer: WebGLBuffer;
    buffers: Map<string, WebGLBuffer>;
    vertexPosition: number;
    positionAttribute: number;
    target: RenderTarget;
    backTarget: RenderTarget;
    uniformsCache: Map<string, WebGLUniformLocation>;
    subEffectId: number;
    frameId: number;

    addBuffer(key: string): WebGLBuffer {
        throw "Not yet implemented";
    }
    render(engine: Demolished.Rendering) {

        let gl = this.gl;
        let ent = this;

        gl.uniform1f(ent.uniformsCache.get('time'), engine.uniforms.time / 1000.);
        gl.uniform1f(ent.uniformsCache.get("timetotal"), engine.uniforms.timeTotal / 1000.);
        gl.uniform4fv(ent.uniformsCache.get("datetime"), engine.uniforms.datetime);
        gl.uniform1f(ent.uniformsCache.get("playbacktime"), engine.audio.currentTime)

        gl.uniform1i(ent.uniformsCache.get("frameId"), engine.animationFrameCount);
        gl.uniform1i(ent.uniformsCache.get("subEffectId"), ent.subEffectId);

        gl.uniform2f(ent.uniformsCache.get("mouse"), engine.uniforms.mouseX, engine.uniforms.mouseY);
        gl.uniform2f(ent.uniformsCache.get("resolution"), engine.uniforms.screenWidth, engine.uniforms.screenHeight);

        gl.bindBuffer(gl.ARRAY_BUFFER, ent.mainBuffer);
        gl.vertexAttribPointer(ent.positionAttribute, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, engine.webGLbuffer);
        gl.vertexAttribPointer(ent.vertexPosition, 2, gl.FLOAT, false, 0, 0);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, ent.backTarget.texture);

        gl.uniform1i(gl.getUniformLocation(ent.glProgram, "backbuffer"), 1);
        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, engine.fftTexture);
        gl.uniform1i(gl.getUniformLocation(ent.glProgram, "fft"), 0);

        ent.textures.forEach((asset: EntityTexture, index: number) => {
            engine.bindTexture(ent, asset, index);
        });

        gl.bindFramebuffer(gl.FRAMEBUFFER, ent.target.frameBuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        ent.swapBuffers();
        // ent.runAction("$subeffects", engine.uniforms.time / 1000);
    }

    addAction(key: string, fn: (ent: ShaderEntity, tm: number) => void) {
        this.actions.set(key, fn);
    }
    runAction(key: string, tm: number):void {
        try{
            this.actions.get(key)(this, tm);
        }catch{
            console.warn(this);
        }
       
         
    }
    removeAction(key: string): boolean {
        return this.actions.delete(key);
    }
    // get vertexHeader(){
    //     let header  = "";
    //     header += "#version 300 es\n" +
    //                         "#ifdef GL_ES\n"+
    //                         "precision highp float;\n" +
    //                         "precision highp int;\n"+
    //                         "precision mediump sampler3D;\n"+
    //                         "#endif\n";
    //     return header;

    // }
    // get fragmentHeader(){
    //     let header = "";
    //     header += "#version 300 es\n"+
    //                 "#ifdef GL_ES\n"+
    //                 "precision highp float;\n"+
    //                 "precision highp int;\n"+
    //                 "precision mediump sampler3D;\n"+
    //                 "#endif\n"
    //         return header;
    // }

    constructor(public gl: WebGLRenderingContext, public name: string, public w: number, public h: number,
        public textures?: Array<EntityTexture>, public shared?: Map<string,string>
    ) {
        super(gl);
        this.uniformsCache = new Map<string, WebGLUniformLocation>();
        

        this.loadShaders().then((numOfShaders: number) => {
            if (numOfShaders > -1) {
                this.setupShader();
                this.target = this.createRenderTarget(this.w, this.h);
                this.backTarget = this.createRenderTarget(this.w, this.h);
            }
        });
    }
    public reset() {
        throw "not yet implemented";
    }
    private createRenderTarget(width: number, height: number): RenderTarget {
        let gl = this.gl;
        let target = new RenderTarget(gl.createFramebuffer(), gl.createRenderbuffer(), gl.createTexture());
    
        gl.bindTexture(gl.TEXTURE_2D, target.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

        gl.bindFramebuffer(gl.FRAMEBUFFER, target.frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);

        gl.bindRenderbuffer(gl.RENDERBUFFER, target.renderBuffer);

        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.renderBuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return target;
    }
    /**
     *  Load fragment and vertex files
     *  TODO: Magnus fix - Shall also load the other buffers's
     * @private
     * @returns {Promise<number>} 
     * @memberof ShaderEntity
     */
    private loadShaders(): Promise<number> {
        let urls = new Array<string>();
        urls.push("entities/shaders/" + this.name + "/fragment.glsl");
        urls.push("entities/shaders/" + this.name + "/vertex.glsl");

        return Promise.all(urls.map((url: string) =>
            loadResource(url).then(resp => resp.text())
        )).then(result => {
            this.fragmentShader = result[0];
            this.vertexShader = result[1];
            return urls.length;
        }).catch((reason) => {
            this.onError(reason);
            return -1;
        });
    }
    
    public setFragment(fs: string) {
      
        this.fragmentShader = fs;
        this.setupShader();
    }

    onSuccess(shader:WebGLShader){ 
    }
    onError(err: any) {
    }
    private createTextureFromImage(width: number, height: number, image: HTMLImageElement) {
        let gl = this.gl;
        let texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    private setupShader() {
        let gl = this.gl;
        this.mainBuffer = gl.createBuffer();
        this.glProgram = gl.createProgram();

        let vs: WebGLShader = this.createShader(gl,ShaderCompiler.vertexHeader + 
            ShaderCompiler.parseIncludes(this.vertexShader,this.shared), gl.VERTEX_SHADER);
        let fs: WebGLShader = this.createShader(gl,ShaderCompiler.fragmentHeader + 
            
            ShaderCompiler.parseIncludes(this.fragmentShader,this.shared), gl.FRAGMENT_SHADER);

        gl.attachShader(this.glProgram, vs);
        gl.attachShader(this.glProgram, fs);

        gl.linkProgram(this.glProgram);

        this.cacheUniformLocation('fft');
        this.cacheUniformLocation("playbacktime");
        this.cacheUniformLocation('time');
        this.cacheUniformLocation("datetime");
        this.cacheUniformLocation('frameId');
        this.cacheUniformLocation("timetotal");
        this.cacheUniformLocation('mouse');
        this.cacheUniformLocation('resolution');
        this.cacheUniformLocation("backbuffer");

        this.subEffectId = 0;
        this.frameId = 0;
        this.positionAttribute = 0;
        gl.enableVertexAttribArray(this.positionAttribute);

        this.vertexPosition = gl.getAttribLocation(this.glProgram, "pos");
        gl.enableVertexAttribArray(this.vertexPosition);

        this.textures.forEach((asset: EntityTexture) => {
            asset.texture = this.createTextureFromImage(asset.width, asset.height, asset.image);
        });
        gl.useProgram(this.glProgram);
    }
    swapBuffers() {
        let tmp = this.target;
        this.target = this.backTarget;
        this.backTarget = tmp;
    }
    private createShader(gl: WebGLRenderingContext, src: string, type: number): WebGLShader {
        let shader: WebGLShader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            this.onError(gl.getShaderInfoLog(shader));
        }else{
            this.onSuccess(shader);
        }
        return shader;
    }
}
