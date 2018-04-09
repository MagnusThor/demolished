import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect } from './demolishedModels'
import loadResource from './demolishedLoader'

export class EntityTexture {
    texture: WebGLTexture;
    constructor(public image: any, public name: string, public width: number, public height: number, public assetType: number) { }
}

export interface IEntity {
    render()
    onError(err: any): void;
    swapBuffers(): void;
    glProgram: WebGLProgram;
    textures: Array<EntityTexture>;
    buffer: WebGLBuffer;
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
    removeAction(key:string);
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
 * @export
 * @class ShaderEntity
 * @extends {EntityBase}
 * @implements {IEntity}
 */
export class ShaderEntity extends EntityBase implements IEntity {
    render() {
        throw "Not yet implemented";
    }
    vertexShader: string;
    fragmentShader: string
    alpha: number;
    buffer: WebGLBuffer;
    vertexPosition: number;
    positionAttribute: number;
    target: RenderTarget;
    backTarget: RenderTarget;
    uniformsCache: Map<string, WebGLUniformLocation>;
    subEffectId: number;
    frameId: number;

    addAction(key: string, fn: (ent: ShaderEntity, tm: number) => void) {
        this.actions.set(key, fn);
    }

    runAction(key: string, tm: number) {
        this.actions.get(key)(this, tm);
    }

    removeAction(key:string):boolean{
       return this.actions.delete(key);
    }
   
    constructor(public gl: WebGLRenderingContext, public name: string, public w: number, public h: number,
        public textures: Array<EntityTexture>
    ) {
        super(gl);
        this.uniformsCache = new Map<string, WebGLUniformLocation>()   
        this.loadShaders().then(() => {
            this.initShader();
            this.target = this.createRenderTarget(this.w, this.h);
            this.backTarget = this.createRenderTarget(this.w, this.h);
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

    private loadShaders(): Promise<boolean> {
        let urls = new Array<string>();
        urls.push("entities/" + this.name + "/fragment.glsl");
        urls.push("entities/" + this.name + "/vertex.glsl");
        return Promise.all(urls.map((url: string) =>
            loadResource(url).then(resp => resp.text())
        )).then(result => {
            this.fragmentShader = result[0];
            this.vertexShader = result[1];
            return true;
        }).catch((reason) => {
            this.onError(reason);
            return false;
        });
    }

    public compile(fs: string, vs?: string) {
        if (vs) {
            this.vertexShader = vs;
        }
        this.fragmentShader = fs;
        this.initShader();
    }

    onError(err) {
        console.error(err)
    }

    private createTextureFromData(width: number, height: number, image: HTMLImageElement) {
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

    private initShader() {
        let gl = this.gl;
        this.buffer = gl.createBuffer();
        this.glProgram = gl.createProgram();

        let vs: WebGLShader = this.createShader(gl, this.vertexShader, gl.VERTEX_SHADER);
        let fs: WebGLShader = this.createShader(gl, this.fragmentShader, gl.FRAGMENT_SHADER);

        gl.attachShader(this.glProgram, vs);
        gl.attachShader(this.glProgram, fs);

        gl.linkProgram(this.glProgram);

        if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
            let info = gl.getProgramInfoLog(this.glProgram);
            let error = gl.getProgramParameter(this.glProgram, gl.VALIDATE_STATUS);
            this.onError(info);
        }

        this.cacheUniformLocation('fft');
        this.cacheUniformLocation('time');
        this.cacheUniformLocation("datetime");
        this.cacheUniformLocation('frameId');
        this.cacheUniformLocation("timeTotal");
        this.cacheUniformLocation('mouse');
        this.cacheUniformLocation('resolution');
        this.cacheUniformLocation("subEffectId");

        this.cacheUniformLocation("backbuffer");

        this.subEffectId = 0;
        this.frameId = 0;
        this.positionAttribute = 0;
        gl.enableVertexAttribArray(this.positionAttribute);

        this.vertexPosition = gl.getAttribLocation(this.glProgram, "position");
        gl.enableVertexAttribArray(this.vertexPosition);

        this.textures.forEach((asset: EntityTexture) => {
            asset.texture = this.createTextureFromData(asset.width, asset.height, asset.image);
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
        return shader;
    }
}
