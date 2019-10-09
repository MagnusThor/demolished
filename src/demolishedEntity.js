"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const demolishedModels_1 = require("./demolishedModels");
const Uniforms_1 = require("./Uniforms");
const demolishedLoader_1 = require("./demolishedLoader");
const demolishedUtils_1 = require("./demolishedUtils");
class EntityBase {
    constructor(gl) {
        this.gl = gl;
    }
    getUniformValues() {
        throw "not implemented";
    }
}
exports.EntityBase = EntityBase;
class ShaderEntity extends EntityBase {
    constructor(gl, name, w, h, textures, shared, engine) {
        super(gl);
        this.gl = gl;
        this.name = name;
        this.w = w;
        this.h = h;
        this.textures = textures;
        this.shared = shared;
        this.engine = engine;
        this.frameId = 0;
        this.positionAttribute = 0;
        this.loadShaders().then((numOfShaders) => {
            if (numOfShaders > -1) {
                this.init();
                this.target = this.createRenderTarget(this.w, this.h);
                this.backTarget = this.createRenderTarget(this.w, this.h);
            }
        });
    }
    onShaderElapsed() {
    }
    onShaderCreated() { }
    onError(err) { }
    setTime(start, stop) {
        this.start = start;
        this.stop = stop;
        ;
    }
    get isElapsed() {
        return this.uniforms.timeTotal >= this.stop;
    }
    render(engine) {
        let gl = this.gl;
        let ent = this;
        this.uniforms.time = performance.now() / 1000;
        this.uniforms.resolution = [this.gl.canvas.width, this.gl.canvas.height];
        this.uniforms.timeTotal = (performance.now() - engine.animationStartTime);
        this.uniforms.mouse = [0.5, 0.5];
        if (this.isElapsed)
            this.onShaderElapsed();
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
        ent.textures.forEach((binding, index) => {
            engine.bindTexture(ent, binding, index);
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, ent.target.frameBuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        ent.swapBuffers();
    }
    reset() {
        this.uniforms.time = 0;
        this.uniforms.timeTotal = 0;
    }
    createRenderTarget(width, height) {
        let gl = this.gl;
        let target = new demolishedModels_1.RenderTarget(gl.createFramebuffer(), gl.createRenderbuffer(), gl.createTexture());
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
    loadShaders() {
        let urls = new Array();
        urls.push("entities/shaders/" + this.name + "/fragment.glsl");
        urls.push("entities/shaders/" + this.name + "/vertex.glsl");
        return Promise.all(urls.map((url) => __awaiter(this, void 0, void 0, function* () {
            const resp = yield demolishedLoader_1.default(url);
            return resp.text();
        }))).then(result => {
            this.fragmentShader = result[0];
            this.vertexShader = result[1];
            return urls.length;
        }).catch((reason) => {
            this.onError(reason);
            return -1;
        });
    }
    setFragment(fs) {
        this.fragmentShader = fs;
        this.init();
    }
    createTextureFromVideo() {
        const gl = this.gl;
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        const level = 0;
        const internalFormat = gl.RGBA;
        const border = 0;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 0, 255, 255]);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, 1, 1, border, srcFormat, srcType, pixel);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        return texture;
    }
    createTextureFromImage(image) {
        let gl = this.gl;
        let texture = gl.createTexture();
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
        let vs = this.createShader(gl, this.vertexShader, gl.VERTEX_SHADER);
        let fs = this.createShader(gl, demolishedUtils_1.ShaderCompiler.parseIncludes(this.fragmentShader, this.shared), gl.FRAGMENT_SHADER);
        gl.attachShader(this.glProgram, vs);
        gl.attachShader(this.glProgram, fs);
        gl.linkProgram(this.glProgram);
        if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
            var info = gl.getProgramInfoLog(this.glProgram);
            this.onError(info);
        }
        let proxy = new Uniforms_1.Uniforms(this.gl, this.glProgram);
        this.uniforms = proxy.createPipleline();
        this.uniforms.cacheUniformLocation('fft')
            .cacheUniformLocation("backbuffer")
            .activeUniforms.forEach((u) => {
            this.uniforms.cacheUniformLocation(u.name);
        });
        gl.enableVertexAttribArray(this.positionAttribute);
        this.vertexPosition = gl.getAttribLocation(this.glProgram, "pos");
        gl.enableVertexAttribArray(this.vertexPosition);
        this.textures.forEach((binding) => {
            console.log("binding", binding);
            let asset = this.engine.textureCache.get(binding.name);
            asset.type == 0 ?
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
    createShader(gl, src, type) {
        let shader = gl.createShader(type);
        let header = type == this.gl.FRAGMENT_SHADER ? demolishedUtils_1.ShaderCompiler.fragmentHeader : demolishedUtils_1.ShaderCompiler.vertexHeader;
        gl.shaderSource(shader, header + src);
        gl.compileShader(shader);
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            let message = gl.getShaderInfoLog(shader);
            this.onError(message);
        }
        else {
            this.onShaderCreated();
        }
        return shader;
    }
}
exports.ShaderEntity = ShaderEntity;
