import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect } from './demolishedModels'
/**
 * 
 * 
 * @export
 * @class EntityTexture
 */
export class EntityTexture {
    texture: WebGLTexture;
    constructor(public image: any, public name: string, public width: number, public height: number, public assetType: number) { }
}

export class EnityBase {

    currentProgram: WebGLProgram
    vertexShader: string;
    fragmetShader: string

    buffer: WebGLBuffer;
    vertexPosition: number;
    positionAttribute: number;

    target: RenderTarget;
    backTarget: RenderTarget;

    uniformsCache: Map<string, WebGLUniformLocation>;

    constructor(public gl: WebGLRenderingContext, public name: string, public x: number, public y: number,
        public assets: Array<EntityTexture>
    ) {
        this.uniformsCache = new Map<string, WebGLUniformLocation>()

        this.loadEntityShaders().then(() => {
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

    loadEntityShaders(): Promise<boolean> {

        let urls = new Array<string>();
        urls.push("entities/" + this.name + "/fragment.glsl");
        urls.push("entities/" + this.name + "/vertex.glsl");

        //  urls.push("entities/" + this.name + "/uniforms.json");
        return Promise.all(urls.map((url: string) =>
            fetch(url).then(resp => resp.text())
        )).then(result => {
            this.fragmetShader = result[0];
            this.vertexShader = result[1];
            return true;
        }).catch((reason) => {
            this.onError(reason);
            return false;
        });
    }

    onError(err) {
        console.error(err)
    }

    createTextureFromData(width: number, height: number, image: HTMLImageElement) {
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

    initShader() {

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
            this.onError(info);
        }

        this.cacheUniformLocation('bpm');
        this.cacheUniformLocation('freq');

        this.cacheUniformLocation("sampleRate");
        this.cacheUniformLocation("fft");

        this.cacheUniformLocation('time');
        this.cacheUniformLocation('mouse');
        this.cacheUniformLocation('resolution');

        this.positionAttribute = 0;// gl.getAttribLocation(this.currentProgram, "surfacePosAttrib");
        gl.enableVertexAttribArray(this.positionAttribute);

        this.vertexPosition = gl.getAttribLocation(this.currentProgram, "position");
        gl.enableVertexAttribArray(this.vertexPosition);

        this.assets.forEach((asset: EntityTexture) => {

            switch (asset.assetType) {
                case 0:
                    asset.texture = this.createTextureFromData(asset.width, asset.height,
                        asset.image);
                    break;
                case 1:
                    //  asset.texture = this.createTextureFromFloat32(32,32,new Float32Array(32*32*4));
                    break;
                default:
                    throw "unknown asset type"
            }

        });

        // this.createTextureFromFloat32(1,2,new Float32Array([255,0,0,255]));

        gl.useProgram(this.currentProgram);

    }
    cacheUniformLocation(label: string) {
        this.uniformsCache.set(label, this.gl.getUniformLocation(this.currentProgram, label));
    }

    swapBuffers() {
        let tmp = this.target;
        this.target = this.backTarget;
        this.backTarget = tmp;
    }
    createShader(gl: WebGLRenderingContext, src: string, type: number): WebGLShader {
        let shader: WebGLShader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
    }
}
