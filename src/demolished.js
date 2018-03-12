"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var demolishedEntity_1 = require("./demolishedEntity");
var demolishedModels_1 = require("./demolishedModels");
var demolishedLoader_1 = require("./demolishedLoader");
var demolishedProperties_1 = require("./demolishedProperties");
var Demolished;
(function (Demolished) {
    var Rendering = (function () {
        function Rendering(canvas, parent, timelineFile, audio) {
            var _this = this;
            this.canvas = canvas;
            this.parent = parent;
            this.timelineFile = timelineFile;
            this.audio = audio;
            this.width = 1;
            this.height = 1;
            this.centerX = 0;
            this.centerY = 0;
            this.resolution = 1;
            this.gl = this.getRendringContext();
            var proxy = new demolishedProperties_1.DemoishedProperty(new demolishedModels_1.Uniforms(this.canvas.width, this.canvas.height));
            this.uniforms = proxy.getObserver();
            this.uniforms.time = 0;
            this.uniforms.timeTotal = 0;
            this.uniforms.mouseX = 0.5;
            this.uniforms.mouseY = 0.5;
            this.entitiesCache = new Array();
            this.timeFragments = new Array();
            this.fftTexture = this.gl.createTexture();
            this.webGLbuffer = this.gl.createBuffer();
            this.addEventListeners();
            this.loadGraph(this.timelineFile).then(function (graph) {
                var audioSettings = graph.audioSettings;
                graph.timeline.forEach(function (tf) {
                    var _tf = new demolishedModels_1.TimeFragment(tf.entity, tf.start, tf.stop, tf.useTransitions);
                    _this.timeFragments.push(_tf);
                });
                _this.timeFragments.sort(function (a, b) {
                    return a.start - b.start;
                });
                _this.audio.createAudio(audioSettings).then(function (state) {
                    graph.effects.forEach(function (effect) {
                        var textures = Promise.all(effect.textures.map(function (texture) {
                            return new Promise(function (resolve, reject) {
                                var image = new Image();
                                image.src = texture.url;
                                image.onload = function () {
                                    resolve(image);
                                };
                                image.onerror = function (err) { return resolve(err); };
                            }).then(function (image) {
                                return new demolishedEntity_1.EntityTexture(image, texture.uniform, texture.width, texture.height, 0);
                            });
                        })).then(function (assets) {
                            _this.addEntity(effect.name, assets);
                            if (_this.entitiesCache.length === graph.effects.length) {
                                _this.onReady(graph);
                            }
                        });
                    });
                    _this.resizeCanvas(_this.parent);
                });
            });
        }
        Rendering.prototype.onFrame = function (frame) { };
        Rendering.prototype.onNext = function (frame) { };
        Rendering.prototype.onStart = function () { };
        Rendering.prototype.onStop = function () { };
        Rendering.prototype.onReady = function (graph) { };
        Rendering.prototype.getRendringContext = function () {
            var renderingContext;
            var contextAttributes = {
                preserveDrawingBuffer: true
            };
            renderingContext =
                this.canvas.getContext('webgl2', contextAttributes) ||
                    this.canvas.getContext('webgl', contextAttributes) ||
                    this.canvas.getContext('experimental-webgl', contextAttributes);
            renderingContext.getExtension('OES_standard_derivatives');
            renderingContext.getExtension("OES_texture_float");
            renderingContext.getExtension("OES_texture_half_float");
            renderingContext.getExtension("OES_texture_half_float_linear");
            renderingContext.getExtension("WEBGL_draw_buffers");
            renderingContext.getExtension("WEBGL_depth_texture");
            renderingContext.getExtension("EXT_shader_texture_lod");
            renderingContext.getExtension("EXT_texture_filter_anisotropic");
            this.webGLbuffer = renderingContext.createBuffer();
            renderingContext.bindBuffer(renderingContext.ARRAY_BUFFER, this.webGLbuffer);
            renderingContext.bufferData(renderingContext.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), renderingContext.STATIC_DRAW);
            return renderingContext;
        };
        Rendering.prototype.loadGraph = function (graphFile) {
            return demolishedLoader_1.default(graphFile).then(function (response) {
                return response.json();
            }).then(function (graph) {
                return graph;
            });
        };
        Rendering.prototype.addEventListeners = function () {
            var _this = this;
            document.addEventListener("mousemove", function (evt) {
                _this.uniforms.mouseX = evt.clientX / window.innerWidth;
                _this.uniforms.mouseY = 1 - evt.clientY / window.innerHeight;
            });
        };
        Rendering.prototype.addEntity = function (name, textures) {
            var entity = new demolishedEntity_1.ShaderEntity(this.gl, name, this.canvas.width, this.canvas.height, textures);
            this.entitiesCache.push(entity);
            var tf = this.timeFragments.filter(function (pre) {
                return pre.entity === name;
            });
            tf.forEach(function (f) {
                f.setEntity(entity);
            });
            return entity;
        };
        Rendering.prototype.tryFindTimeFragment = function (time) {
            return this.timeFragments.find(function (tf) {
                return time < tf.stop && time >= tf.start;
            });
        };
        Rendering.prototype.resetClock = function (time) {
            this.uniforms.timeTotal = time;
            this.animationFrameCount = 0;
            this.animationOffsetTime = time;
            this.animationStartTime = performance.now();
            this.audio.currentTime = (time / 1000) % 60;
        };
        Rendering.prototype.start = function (time) {
            this.uniforms.timeTotal = time;
            this.animationFrameCount = 0;
            this.animationOffsetTime = time;
            this.currentTimeFragment = this.tryFindTimeFragment(time);
            this.animationStartTime = performance.now();
            this.animate(time);
            this.audio.currentTime = (time / 1000) % 60;
            this.audio.play();
            if (!this.isPaused)
                this.onStart();
        };
        Rendering.prototype.stop = function () {
            this.audio.stop();
            cancelAnimationFrame(this.animationFrameId);
            ;
            this.onStop();
            return this.animationFrameId;
        };
        Rendering.prototype.mute = function () {
            this.isSoundMuted = !this.isSoundMuted;
            this.audio.mute(this.isSoundMuted);
        };
        Rendering.prototype.pause = function () {
            if (!this.isPaused) {
                this.isPaused = true;
                this.stop();
            }
            else {
                this.isPaused = false;
                this.resume(this.uniforms.time);
            }
            return this.uniforms.time;
        };
        Rendering.prototype.resume = function (time) {
            this.start(time);
        };
        Rendering.prototype.updateTextureData = function (texture, size, bytes) {
            var gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        };
        Rendering.prototype.animate = function (time) {
            var _this = this;
            var animationTime = time - this.animationStartTime;
            this.animationFrameId = requestAnimationFrame(function (_time) {
                _this.animate(_time);
            });
            if (this.audio) {
                this.updateTextureData(this.fftTexture, this.audio.textureSize, this.audio.getFrequenceData());
            }
            else {
                this.updateTextureData(this.fftTexture, this.audio.textureSize, new Uint8Array(1024));
            }
            if (this.currentTimeFragment) {
                if (animationTime >= this.currentTimeFragment.stop) {
                    this.currentTimeFragment = this.tryFindTimeFragment(time);
                }
                this.currentTimeFragment ?
                    this.renderEntities(this.currentTimeFragment.entityShader, animationTime) : this.start(0);
            }
            this.onFrame({
                frame: this.animationFrameCount,
                ms: animationTime,
                min: Math.floor(animationTime / 60000) % 60,
                sec: Math.floor((animationTime / 1000) % 60),
            });
        };
        Rendering.prototype.surfaceCorners = function () {
            if (this.gl) {
                this.width = this.height * this.uniforms.screenWidth / this.uniforms.screenHeight;
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
        };
        Rendering.prototype.setViewPort = function (width, height) {
            this.gl.viewport(0, 0, width, height);
        };
        Rendering.prototype.resizeCanvas = function (parent, resolution) {
            if (resolution)
                this.resolution = resolution;
            var width = parent.clientWidth / this.resolution;
            var height = parent.clientHeight / this.resolution;
            console.log(width, height);
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.style.width = parent.clientWidth + 'px';
            this.canvas.style.height = parent.clientHeight + 'px';
            this.uniforms.screenWidth = width;
            this.uniforms.screenHeight = height;
            this.surfaceCorners();
            this.setViewPort(this.canvas.width, this.canvas.height);
        };
        Rendering.prototype.updateUniforms = function () {
            throw "Not yet implemented";
        };
        Rendering.prototype.renderEntities = function (ent, ts) {
            var gl = this.gl;
            this.uniforms.time = ts;
            this.uniforms.timeTotal = (performance.now() - this.animationStartTime);
            gl.useProgram(ent.currentProgram);
            gl.uniform1f(ent.uniformsCache.get("timeTotal"), this.uniforms.timeTotal / 1000);
            gl.uniform1f(ent.uniformsCache.get('time'), this.uniforms.time / 1000);
            gl.uniform1i(ent.uniformsCache.get("frame"), this.animationFrameCount);
            gl.uniform2f(ent.uniformsCache.get('mouse'), this.uniforms.mouseX, this.uniforms.mouseY);
            gl.uniform2f(ent.uniformsCache.get('resolution'), this.uniforms.screenWidth, this.uniforms.screenHeight);
            gl.bindBuffer(gl.ARRAY_BUFFER, ent.buffer);
            gl.vertexAttribPointer(ent.positionAttribute, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGLbuffer);
            gl.vertexAttribPointer(ent.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, ent.backTarget.texture);
            gl.uniform1i(gl.getUniformLocation(ent.currentProgram, "backbuffer"), 1);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.fftTexture);
            gl.uniform1i(gl.getUniformLocation(ent.currentProgram, "fft"), 0);
            var offset = 2;
            ent.assets.forEach(function (asset, index) {
                gl.activeTexture(gl.TEXTURE0 + (offset + index));
                gl.bindTexture(gl.TEXTURE_2D, asset.texture);
                gl.uniform1i(gl.getUniformLocation(ent.currentProgram, asset.name), offset + index);
            });
            gl.bindFramebuffer(gl.FRAMEBUFFER, ent.target.frameBuffer);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            ent.swapBuffers();
            this.animationFrameCount++;
        };
        __decorate([
            demolishedProperties_1.Observe(true),
            __metadata("design:type", demolishedModels_1.Uniforms)
        ], Rendering.prototype, "uniforms", void 0);
        return Rendering;
    }());
    Demolished.Rendering = Rendering;
})(Demolished = exports.Demolished || (exports.Demolished = {}));
