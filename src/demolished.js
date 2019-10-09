"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const demolishedEntity_1 = require("./demolishedEntity");
const Graph_1 = require("./Graph");
const TextureCache_1 = require("./TextureCache");
var Demolished;
(function (Demolished) {
    class Rendering {
        constructor(canvas, parent, graphFile, audio) {
            this.canvas = canvas;
            this.parent = parent;
            this.graphFile = graphFile;
            this.audio = audio;
            this.width = 1;
            this.height = 1;
            this.centerX = 0;
            this.centerY = 0;
            this.resolution = 1;
            this.gl = this.getRendringContext();
            this.entitiesCache = new Array();
            this.fftTexture = this.gl.createTexture();
            this.webGLbuffer = this.gl.createBuffer();
            this.textureCache = new TextureCache_1.TextureCache();
            Graph_1.Graph.Load(this.graphFile, this).then((g) => {
                this.resizeCanvas(this.parent);
                this.onReady(g);
            }).catch(reason => this.onError(reason));
        }
        onFrame() { }
        onNext() { }
        onStart() { }
        onStop() { }
        onReady(g) { }
        onError(message) {
            console.error(message);
        }
        getRendringContext() {
            let renderingContext;
            let contextAttributes = {
                preserveDrawingBuffer: true
            };
            renderingContext =
                this.canvas.getContext('webgl2', contextAttributes) ||
                    this.canvas.getContext('webgl', contextAttributes) ||
                    this.canvas.getContext('experimental-webgl', contextAttributes);
            renderingContext.getExtension('OES_standard_derivatives');
            renderingContext.getExtension('OES_texture_float_linear');
            renderingContext.getExtension('OES_texture_half_float_linear');
            renderingContext.getExtension('EXT_texture_filter_anisotropic');
            renderingContext.getExtension('EXT_color_buffer_float');
            renderingContext.getExtension("WEBGL_depth_texture");
            renderingContext.getExtension("EXT_shader_texture_lod");
            this.webGLbuffer = renderingContext.createBuffer();
            renderingContext.bindBuffer(renderingContext.ARRAY_BUFFER, this.webGLbuffer);
            renderingContext.bufferData(renderingContext.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), renderingContext.STATIC_DRAW);
            return renderingContext;
        }
        get duration() {
            return this.graph.duration;
        }
        getEntity(name) {
            return this.entitiesCache.find((p) => {
                return p.name === name;
            });
        }
        addEntity(name, textures) {
            const entity = new demolishedEntity_1.ShaderEntity(this.gl, name, this.canvas.width, this.canvas.height, textures, this.shared, this);
            this.entitiesCache.push(entity);
            return entity;
        }
        nextEntity() {
            if (!this.isPlaybackMode) {
                return this.entitiesCache.find((a) => {
                    return a.name === "stub";
                });
            }
            else {
                throw "Playmode not implemented";
            }
        }
        resetClock() {
            this.shaderEntity.uniforms.time = 0;
            this.shaderEntity.uniforms.timeTotal = 0;
            this.audio.currentTime = 0;
        }
        start(time) {
            this.animationFrameCount = 0;
            this.animationOffsetTime = time;
            this.shaderEntity = this.nextEntity();
            this.animationStartTime = performance.now();
            this.animate(time);
            this.audio.currentTime = (time / 1000) % 60;
            this.audio.play();
            if (!this.isPaused)
                this.onStart();
        }
        stop() {
            this.audio.stop();
            cancelAnimationFrame(this.animationFrameId);
            ;
            this.onStop();
            return this.animationFrameId;
        }
        mute() {
            this.isSoundMuted = !this.isSoundMuted;
            this.audio.mute(this.isSoundMuted);
        }
        pause() {
            if (!this.isPaused) {
                this.isPaused = true;
                this.stop();
            }
            else {
                this.isPaused = false;
                this.resume(this.shaderEntity.uniforms.time);
            }
            return this.shaderEntity.uniforms.time;
        }
        resume(time) {
            this.audio.play();
            this.animationOffsetTime = time;
            this.animationStartTime = performance.now();
            this.animate(time);
        }
        updateTextureData(texture, size, bytes) {
            let gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        animate(time) {
            let animationTime = time - this.animationStartTime;
            this.animationFrameId = requestAnimationFrame((_time) => this.animate(_time));
            if (this.audio) {
                this.updateTextureData(this.fftTexture, this.audio.textureSize, this.audio.getFrequenceData());
            }
            else {
                this.updateTextureData(this.fftTexture, this.audio.textureSize, new Uint8Array(1024));
            }
            if (this.shaderEntity) {
                this.shaderEntity ?
                    this.renderEntities(this.shaderEntity, animationTime) : this.start(0);
            }
            this.onFrame();
        }
        surfaceCorners(sw, sh) {
            if (this.gl) {
                this.width = this.height * sw / sh;
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.webGLbuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
                    this.centerX - this.width, this.centerY - this.height,
                    this.centerX + this.width, this.centerY - this.height,
                    this.centerX - this.width, this.centerY + this.height,
                    this.centerX + this.width, this.centerY - this.height,
                    this.centerX + this.width, this.centerY + this.height,
                    this.centerX - this.width, this.centerY + this.height
                ]), this.gl.STATIC_DRAW);
            }
        }
        setViewPort(width, height) {
            this.gl.viewport(0, 0, width, height);
        }
        resizeCanvas(parent, resolution) {
            if (resolution)
                this.resolution = resolution;
            let d = { w: parent.clientWidth / this.resolution, h: parent.clientHeight / this.resolution };
            this.canvas.width = d.w;
            this.canvas.height = d.h;
            this.canvas.style.width = parent.clientWidth + 'px';
            this.canvas.style.height = parent.clientHeight + 'px';
            this.surfaceCorners(d.w, d.h);
            this.setViewPort(this.canvas.width, this.canvas.height);
        }
        renderEntities(ent, ts) {
            this.shaderEntity.uniforms.time = ts;
            this.shaderEntity.uniforms.timeTotal = (performance.now() - this.animationStartTime);
            this.gl.useProgram(ent.glProgram);
            ent.render(this);
            this.animationFrameCount++;
        }
        bindTexture(ent, textureBinding, c) {
            let entityTexture = this.textureCache.get(textureBinding.name);
            let gl = this.gl;
            gl.activeTexture(gl.TEXTURE0 + (1 + c));
            gl.bindTexture(gl.TEXTURE_2D, entityTexture.texture);
            gl.uniform1i(gl.getUniformLocation(ent.glProgram, textureBinding.uniform), 1 + c);
            if (entityTexture.type == 1)
                entityTexture.update(this.gl);
        }
        getTextures() {
            let result = new Array();
            return result;
        }
    }
    Demolished.Rendering = Rendering;
})(Demolished = exports.Demolished || (exports.Demolished = {}));
