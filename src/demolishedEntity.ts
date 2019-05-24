import { RenderTarget } from './demolishedModels'
import { Uniforms } from "./Uniforms";
import loadResource from './demolishedLoader'
import { Demolished } from './demolished';
import { ShaderCompiler } from './demolishedUtils';

export class IEntityTexture {
    texture: WebGLTexture
    name: string;
    width: number;
    height: number
    assetType: number
    update: any;
}

export class EntityTexture implements IEntityTexture {
    texture: WebGLTexture;
    assetType: number;
    constructor(public data: any, public name: string, public width: number, public height: number) {
        this.assetType = 0;
    }
    update(gl): void {
    }
}


export class EntityVideoTexture implements IEntityTexture {
    texture: WebGLTexture;
    assetType: number;
    update(gl) {
        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            srcFormat, srcType, this.data);
    }
    constructor(public data: any, public name: string, public width: number, public height: number) {
        this.assetType = 1;
    }
}
export interface IEntity {
    render(engine: Demolished.Rendering):void;
    onError(err: any): void;
    swapBuffers(): void;
    glProgram: WebGLProgram;
    textures?: Array<IEntityTexture>;
    mainBuffer: WebGLBuffer;
    vertexPosition: number;
    positionAttribute: number;
    target: RenderTarget;
    backTarget: RenderTarget;
    frameId: number;
    uniforms: Uniforms;
}
/**
 *  
 * 
 * @export
 * @class EntityBase
 */
export class EntityBase {
    uniforms: Uniforms;
    glProgram: WebGLProgram
    constructor(public gl: WebGLRenderingContext) {
    }
    getUniformValues(): Array<any> {
        throw "not implemented"
    }
}
/**
 * @export
 * @class ShaderEntity
 * @extends {EntityBase}
 * @implements {IEntity}
 */
export class ShaderEntity extends EntityBase implements IEntity {
    
    vertexShader: string;
    fragmentShader: string
    
    mainBuffer: WebGLBuffer;
    buffers: Map<string, WebGLBuffer>;
    target: RenderTarget;
    backTarget: RenderTarget;
    
    alpha: number;
    frameId: number = 0;
    vertexPosition: number;
    positionAttribute: number = 0;

    start:number;
    stop:number;
    
    onShaderElapsed(): void {
      
     }

    onShaderCreated(): void { }
    onError(err: any): void { }
    setTime(start:number,stop:number){
        this.start = start;
        this.stop  = stop;;
    }

    get isElapsed(){
            return this.uniforms.timeTotal >= this.stop;
    }

    render(engine: Demolished.Rendering) {
        let gl = this.gl;
        let ent = this;
        
        this.uniforms.time = performance.now()/ 1000;  
        
        this.uniforms.resolution = [this.gl.canvas.width,this.gl.canvas.height];
        this.uniforms.timeTotal = (performance.now() - engine.animationStartTime);

        this.uniforms.mouse = [0.5,0.5];
        
        if(this.isElapsed) this.onShaderElapsed();

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

    }

    constructor(public gl: WebGLRenderingContext, public name: string, public w: number, public h: number,
        public textures?: Array<EntityTexture>, public shared?: Map<string, string>,
        public engine?: Demolished.Rendering) {
        super(gl);
        this.loadShaders().then((numOfShaders: number) => {
            if (numOfShaders > -1) {
                this.init();
                this.target = this.createRenderTarget(this.w, this.h);
                this.backTarget = this.createRenderTarget(this.w, this.h);
            }
        });
    }
    public reset() {
         this.uniforms.time = 0;
         this.uniforms.timeTotal = 0;
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

        return Promise.all(urls.map(async (url: string) =>
            {
                const resp = await loadResource(url);
            return resp.text();
            }
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
        this.init();
    }

  
    public createTextureFromArray(data: Array<number>) {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixels = new Uint8Array(data);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            1, 1, border, srcFormat, srcType,
            pixels);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        return texture;


    }
    private createTextureFromVideo() {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;

        const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
            1, 1, border, srcFormat, srcType,
            pixel);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        return texture;

    }

    private createTextureFromImage(image: HTMLImageElement) {
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

    init() {
        let gl = this.gl;
        this.mainBuffer = gl.createBuffer();
        this.glProgram = gl.createProgram();


        let vs: WebGLShader = this.createShader(gl,this.vertexShader, gl.VERTEX_SHADER);
       
        let fs: WebGLShader = this.createShader(gl,
        ShaderCompiler.parseIncludes(this.fragmentShader, this.shared), gl.FRAGMENT_SHADER);

        gl.attachShader(this.glProgram, vs);
        gl.attachShader(this.glProgram, fs);
        gl.linkProgram(this.glProgram);


        if ( !gl.getProgramParameter( this.glProgram, gl.LINK_STATUS) ) {
            var info = gl.getProgramInfoLog(this.glProgram);
            this.onError(info);
          }

        let proxy = new Uniforms(this.gl, this.glProgram);
       
        this.uniforms = proxy.createPipleline(); 

        
        this.uniforms.cacheUniformLocation('fft')
        .cacheUniformLocation("backbuffer")
        .activeUniforms.forEach( (u:any) =>{
            this.uniforms.cacheUniformLocation(u.name);
        });

              
        gl.enableVertexAttribArray(this.positionAttribute);

        this.vertexPosition = gl.getAttribLocation(this.glProgram, "pos");
        gl.enableVertexAttribArray(this.vertexPosition);

        this.textures.forEach((asset: EntityTexture) => {
            asset.assetType == 0 ?
                asset.texture = this.createTextureFromImage(asset.data) :
                asset.texture = this.createTextureFromVideo();
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
        let header = type == this.gl.FRAGMENT_SHADER ? ShaderCompiler.fragmentHeader : ShaderCompiler.vertexHeader;
        gl.shaderSource(shader, header + src);
        gl.compileShader(shader);
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);        
        if (!success) {
            let message = gl.getShaderInfoLog(shader);          
            this.onError(message);
        } else {
            this.onShaderCreated();
        }
        return shader;
    }
}
