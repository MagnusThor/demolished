"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var demolishedEntity_1 = require("./demolishedEntity");
var demolishedModels_1 = require("./demolishedModels");
var demolishedLoader_1 = require("./demolishedLoader");
var Demolished;
(function (Demolished) {
    var Rendering = (function () {
        function Rendering(canvas, parent, timelineFile, audio, uniforms) {
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
            if (!uniforms) {
                this.uniforms = new demolishedModels_1.Uniforms(this.canvas.width, this.canvas.height);
            }
            else {
                this.uniforms = uniforms;
            }
            this.entitiesCache = new Array();
            this.timeFragments = new Array();
            this.fftTexture = this.gl.createTexture();
            this.webGLbuffer = this.gl.createBuffer();
            this.shared = new Map();
            this.addEventListeners();
            if (this.timelineFile != "") {
                this.loadGraph(this.timelineFile).then(function (graph) {
                    _this.graph = graph;
                    var audioSettings = graph.audioSettings;
                    graph.timeline.forEach(function (tf) {
                        var _tf = new demolishedModels_1.TimeFragment(tf.entity, tf.start, tf.stop, tf.subeffects);
                        _this.timeFragments.push(_tf);
                    });
                    _this.timeFragments.sort(function (a, b) {
                        return a.start - b.start;
                    });
                    _this.loadShared(graph.shared.glsl).then(function () {
                        _this.audio.createAudio(audioSettings).then(function (state) {
                            graph.effects.forEach(function (effect) {
                                var textures = Promise.all(effect.textures.map(function (texture) {
                                    return new Promise(function (resolve, reject) {
                                        var image = new Image();
                                        image.src = texture.src;
                                        image.onload = function () {
                                            resolve(image);
                                        };
                                        image.onerror = function (err) { return resolve(err); };
                                    }).then(function (image) {
                                        return new demolishedEntity_1.EntityTexture(image, texture.uniform, texture.width, texture.height, 0);
                                    });
                                })).then(function (textures) {
                                    _this.addEntity(effect.name, textures);
                                    if (_this.entitiesCache.length === graph.effects.length) {
                                        _this.onReady(graph);
                                    }
                                });
                            });
                            _this.resizeCanvas(_this.parent);
                        });
                    });
                });
            }
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
        };
        Rendering.prototype.loadGraph = function (graphFile) {
            return demolishedLoader_1.default(graphFile).then(function (response) {
                return response.json();
            }).then(function (graph) {
                return graph;
            });
        };
        Rendering.prototype.loadShared = function (files) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                Promise.all(files.map(function (f) {
                    demolishedLoader_1.default(f).then(function (resp) { return resp.text(); }).then(function (result) {
                        _this.shared.set(f, result + "\n");
                    });
                })).then(function () {
                    resolve(true);
                });
            });
        };
        Object.defineProperty(Rendering.prototype, "duration", {
            get: function () {
                return 0;
            },
            enumerable: true,
            configurable: true
        });
        Rendering.prototype.addEventListeners = function () {
            var _this = this;
            document.addEventListener("mousemove", function (evt) {
                _this.uniforms.mouseX = evt.clientX / window.innerWidth;
                _this.uniforms.mouseY = 1 - evt.clientY / window.innerHeight;
            });
        };
        Rendering.prototype.getEntity = function (name) {
            return this.entitiesCache.find(function (p) {
                return p.name === name;
            });
        };
        Rendering.prototype.addEntity = function (name, textures) {
            var entity = new demolishedEntity_1.ShaderEntity(this.gl, name, this.canvas.width, this.canvas.height, textures, this.shared);
            this.entitiesCache.push(entity);
            var tf = this.timeFragments.filter(function (pre) {
                return pre.entity === name;
            });
            tf.forEach(function (f) {
                f.setEntity(entity);
            });
        };
        Rendering.prototype.tryFindTimeFragment = function (time) {
            var fragment = this.timeFragments.find(function (tf) {
                return time < tf.stop && time >= tf.start;
            });
            if (fragment)
                fragment.init();
            return fragment;
        };
        Rendering.prototype.resetClock = function (time) {
            this.currentTimeFragment.reset();
            this.stop();
            this.start(time);
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
            this.animationFrameId = requestAnimationFrame(function (_time) { return _this.animate(_time); });
            if (this.audio) {
                this.updateTextureData(this.fftTexture, this.audio.textureSize, this.audio.getFrequenceData());
            }
            else {
                this.updateTextureData(this.fftTexture, this.audio.textureSize, new Uint8Array(1024));
            }
            if (this.currentTimeFragment) {
                if (animationTime >= this.currentTimeFragment.stop)
                    this.currentTimeFragment = this.tryFindTimeFragment(time);
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
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.style.width = parent.clientWidth + 'px';
            this.canvas.style.height = parent.clientHeight + 'px';
            this.uniforms.screenWidth = width;
            this.uniforms.screenHeight = height;
            this.surfaceCorners();
            this.setViewPort(this.canvas.width, this.canvas.height);
        };
        Rendering.prototype.getCurrentUniforms = function () {
            return this.currentTimeFragment.entityShader.uniformsCache;
        };
        Rendering.prototype.updateUniforms = function () {
            throw "Not yet implemented";
        };
        Rendering.prototype.renderEntities = function (ent, ts) {
            this.uniforms.time = ts;
            this.uniforms.timeTotal = (performance.now() - this.animationStartTime);
            this.gl.useProgram(ent.glProgram);
            ent.render(this);
            this.animationFrameCount++;
        };
        Rendering.prototype.addTexture = function (ent, entityTexture) {
            ent.textures.push(entityTexture);
        };
        Rendering.prototype.bindTexture = function (ent, entityTexture, c) {
            var gl = this.gl;
            gl.activeTexture(gl.TEXTURE0 + (1 + c));
            gl.bindTexture(gl.TEXTURE_2D, entityTexture.texture);
            gl.uniform1i(gl.getUniformLocation(ent.glProgram, entityTexture.name), 1 + c);
        };
        return Rendering;
    }());
    Demolished.Rendering = Rendering;
})(Demolished = exports.Demolished || (exports.Demolished = {}));
