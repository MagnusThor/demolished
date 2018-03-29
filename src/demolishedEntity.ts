import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect } from './demolishedModels'
import loadResource from './demolishedLoader'

export class EntityTexture {
    texture: WebGLTexture;
    constructor(public image: any, public name: string, public width: number, public height: number, public assetType: number) { }
}

export interface IEntity{
    render()
    onError(err:any):void;
    swapBuffers():void;
    currentProgram:WebGLProgram;
    textures: Array<EntityTexture>;
    buffer:WebGLBuffer;
    vertexPosition: number;
    positionAttribute: number;
    target: RenderTarget;
    backTarget: RenderTarget;
    uniformsCache: Map<string, WebGLUniformLocation>;
}
export class EntityBase{
     
    currentProgram: WebGLProgram
    uniformsCache: Map<string, WebGLUniformLocation>;
    constructor(public gl: WebGLRenderingContext){
    }
        cacheUniformLocation(label: string) {
        this.uniformsCache.set(label, this.gl.getUniformLocation(this.currentProgram, label));
    }
}

export class ShaderEntity  extends EntityBase implements IEntity {
    render(){
        throw "Not yet implemented";
    }
    vertexShader: string;
    fragmetShader: string
    alpha:number;
    buffer: WebGLBuffer;
    vertexPosition: number;
    positionAttribute: number;
    target: RenderTarget;
    backTarget: RenderTarget;
    uniformsCache: Map<string, WebGLUniformLocation>;

    constructor(public gl: WebGLRenderingContext, public name: string, public x: number, public y: number,
        public textures: Array<EntityTexture>
    ) {
        super(gl);
        this.uniformsCache = new Map<string, WebGLUniformLocation>()
        this.loadShaders().then(() => {
            this.initShader();
            this.target = this.createRenderTarget(this.x, this.y);
            this.backTarget = this.createRenderTarget(this.x, this.y);
        });
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
            this.fragmetShader = result[0];
            this.vertexShader = result[1];
            return true;
        }).catch((reason) => {
            this.onError(reason);
            return false;
        });
    }

    public reCompile(fs:string,vs?:string){
        if(vs){
            this.vertexShader = vs;
        }
        this.fragmetShader = fs;
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

        gl.bindTexture(gl.TEXTURE_2D, null)

        return texture;
    }
  
    private initShader() {
        let gl = this.gl;
        this.buffer = gl.createBuffer();
        this.currentProgram = gl.createProgram();

        let vs: WebGLShader = this.createShader(gl, this.vertexShader, gl.VERTEX_SHADER);
        let fs: WebGLShader = this.createShader(gl, this.fragmetShader, gl.FRAGMENT_SHADER);

        gl.attachShader(this.currentProgram, vs);
        gl.attachShader(this.currentProgram, fs);

        gl.linkProgram(this.currentProgram);

        if (!gl.getProgramParameter(this.currentProgram, gl.LINK_STATUS)) {
            let info = gl.getProgramInfoLog(this.currentProgram);
            let error = gl.getProgramParameter(this.currentProgram,gl.VALIDATE_STATUS);
            this.onError(info);
        }
      
        this.cacheUniformLocation('fft');
        this.cacheUniformLocation('time');
        this.cacheUniformLocation("datetime");
        this.cacheUniformLocation('frame');
        this.cacheUniformLocation("timeTotal");
        this.cacheUniformLocation('mouse');
        this.cacheUniformLocation('resolution');
        this.cacheUniformLocation('alpha');

       this.cacheUniformLocation("backbuffer");

        this.positionAttribute = 0; 
        // gl.getAttribLocation(this.currentProgram, "surfacePosAttrib");
        gl.enableVertexAttribArray(this.positionAttribute);

        this.vertexPosition = gl.getAttribLocation(this.currentProgram, "position");
        gl.enableVertexAttribArray(this.vertexPosition);

        this.textures.forEach((asset: EntityTexture) => {
                asset.texture = this.createTextureFromData(asset.width, asset.height,asset.image);
        });
        // this.alpha = gl.getAttribLocation(this.currentProgram,"alpha");
        // gl.enableVertexAttribArray(this.alpha);
        gl.useProgram(this.currentProgram);
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
