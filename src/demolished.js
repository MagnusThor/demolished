"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var demolishedUtils_1 = require("./demolishedUtils");
var demolishedEntity_1 = require("./demolishedEntity");
var demolishedModels_1 = require("./demolishedModels");
var demolishedLoader_1 = require("./demolishedLoader");
var Demolished;
(function (Demolished) {
    var Rendering = (function () {
        function Rendering(canvas, timelineFile, simpleCanvas) {
            var _this = this;
            this.canvas = canvas;
            this.timelineFile = timelineFile;
            this.simpleCanvas = simpleCanvas;
            this.width = 1;
            this.height = 1;
            this.centerX = 0;
            this.centerY = 0;
            this.gl = this.getRendringContext();
            this.uniforms = new demolishedModels_1.Uniforms(this.canvas.width, this.canvas.height);
            this.uniforms.time = 0;
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
                    var _tf = new demolishedModels_1.TimeFragment(tf.entity, tf.start, tf.stop, tf.useTransitions, tf.overlays);
                    _this.timeFragments.push(_tf);
                });
                _this.timeFragments.sort(function (a, b) {
                    return a.start - b.start;
                });
                _this.createAudio(audioSettings.audioFile).then(function (analyzer) {
                    _this.audioAnalyser = analyzer;
                    _this.audioAnalyser.smoothingTimeConstant = audioSettings.audioAnalyzerSettings.smoothingTimeConstant;
                    _this.audioAnalyser.fftSize = audioSettings.audioAnalyzerSettings.fftSize;
                    _this.audioAnalyser.maxDecibels = audioSettings.audioAnalyzerSettings.minDecibels;
                    _this.audioAnalyser.minDecibels = audioSettings.audioAnalyzerSettings.maxDecibels;
                    graph.effects.forEach(function (effect) {
                        var textures = Promise.all(effect.textures.map(function (texture) {
                            return new Promise(function (resolve, reject) {
                                var image = new Image();
                                image.src = texture.url;
                                image.onload = function () {
                                    resolve(image);
                                };
                                console.log(texture);
                                image.onerror = function (err) { return resolve(err); };
                            }).then(function (image) {
                                return new demolishedEntity_1.EntityTexture(image, texture.uniform, texture.width, texture.height, 0);
                            });
                        })).then(function (assets) {
                            _this.addEntity(effect.name, assets);
                            if (_this.entitiesCache.length === graph.effects.length) {
                                _this.onReady();
                                _this.resizeCanvas();
                            }
                        });
                    });
                    _this.resizeCanvas();
                });
            });
        }
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
        Rendering.prototype.onFrame = function (frame) { };
        Rendering.prototype.onNext = function (frame) { };
        Rendering.prototype.onStart = function () { };
        Rendering.prototype.onStop = function () { };
        Rendering.prototype.onReady = function () { };
        Rendering.prototype.getAudioTracks = function () {
            return;
        };
        Rendering.prototype.createAudio = function (src) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                demolishedLoader_1.default(src).then(function (resp) {
                    return resp.arrayBuffer().then(function (buffer) {
                        var audioCtx = new AudioContext();
                        audioCtx.decodeAudioData(buffer, function (audioData) {
                            var offlineCtx = new OfflineAudioContext(1, audioData.length, audioData.sampleRate);
                            var filteredSource = offlineCtx.createBufferSource();
                            filteredSource.buffer = audioData;
                            filteredSource.connect(offlineCtx.destination);
                            var filterOffline = offlineCtx.createBiquadFilter();
                            filterOffline.type = 'highpass';
                            filterOffline.Q.value = 2;
                            filterOffline.frequency.value = 2000;
                            filteredSource.connect(filterOffline);
                            filterOffline.connect(offlineCtx.destination);
                            filteredSource.start(0);
                            var source = audioCtx.createBufferSource();
                            source.buffer = audioData;
                            source.connect(audioCtx.destination);
                            offlineCtx.startRendering().then(function (renderedBuffer) {
                                var audioCtx = new AudioContext();
                                var audioEl = new Audio();
                                audioEl.preload = "auto";
                                audioEl.src = src;
                                audioEl.crossOrigin = "anonymous";
                                var onLoad = function () {
                                    var source = audioCtx.createMediaElementSource(audioEl);
                                    var analyser = audioCtx.createAnalyser();
                                    _this.audio = audioEl;
                                    source.connect(analyser);
                                    analyser.connect(audioCtx.destination);
                                    resolve(analyser);
                                    window.addEventListener("load", onLoad, false);
                                };
                                onLoad();
                                var bufferSource = audioCtx.createBufferSource();
                                bufferSource.buffer = renderedBuffer;
                                var analyser = audioCtx.createAnalyser();
                                _this.peaks = demolishedUtils_1.Utils.Audio.getPeaksAtThreshold(renderedBuffer.getChannelData(0), audioData.sampleRate, 0.21);
                                _this.uniforms.bpm = (demolishedUtils_1.Utils.Array.average(demolishedUtils_1.Utils.Array.delta(_this.peaks)) / audioData.sampleRate) * 1000;
                            });
                        });
                    });
                });
            });
        };
        Rendering.prototype.addEventListeners = function () {
            var _this = this;
            document.addEventListener("mousemove", function (evt) {
                _this.uniforms.mouseX = evt.clientX / window.innerWidth;
                _this.uniforms.mouseY = 1 - evt.clientY / window.innerHeight;
            });
            window.addEventListener("resize", function () {
                _this.resizeCanvas();
            });
        };
        Rendering.prototype.addEntity = function (name, textures) {
            var entity = new demolishedEntity_1.EntityBase(this.gl, name, this.canvas.width, this.canvas.height, textures);
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
            var parent = document.querySelector("#main");
            this.removeLayers(parent);
            var timeFragment = this.timeFragments.find(function (tf) {
                return time < tf.stop && time >= tf.start;
            });
            if (!timeFragment)
                return;
            if (timeFragment.hasLayers) {
                timeFragment.overlays.forEach(function (overlay) {
                    var layer = document.createElement("div");
                    layer.id = overlay.name;
                    overlay.classList.forEach(function (className) {
                        layer.classList.add(className);
                    });
                    layer.innerHTML = overlay.markup;
                    layer.classList.add("layer");
                    parent.appendChild(layer);
                });
            }
            if (timeFragment)
                [
                    this.onNext({
                        d: time - this.animationStartTime,
                        c: this.animationFrameCount,
                        t: time - this.animationStartTime,
                        fps: 1000 / (time / this.animationFrameCount)
                    })
                ];
            return timeFragment;
        };
        Rendering.prototype.start = function (time) {
            this.animationFrameCount = 0;
            this.animationOffsetTime = time;
            this.currentTimeFragment = this.tryFindTimeFragment(time);
            this.animationStartTime = performance.now();
            this.animate(time);
            this.audio.currentTime = (time / 1000) % 60;
            this.audio.play();
            this.onStart();
        };
        Rendering.prototype.stop = function () {
            cancelAnimationFrame(this.animationFrameId);
            ;
            this.onStop();
            return this.animationFrameId;
        };
        Rendering.prototype.updateTextureData = function (texture, width, height, bytes) {
            var gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
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
            if (this.audioAnalyser) {
                var bufferLength = this.audioAnalyser.frequencyBinCount;
                var freqArray = new Uint8Array(bufferLength);
                this.audioAnalyser.getByteFrequencyData(freqArray);
                this.updateTextureData(this.fftTexture, 32, 32, freqArray);
                this.uniforms.freq = demolishedUtils_1.Utils.Array.average(freqArray);
            }
            if (this.currentTimeFragment) {
                if (animationTime >= this.currentTimeFragment.stop) {
                    this.currentTimeFragment = this.tryFindTimeFragment(time);
                }
                if (this.currentTimeFragment.transition) {
                    this.currentTimeFragment.transition.fadeIn(time);
                }
                this.renderEntities(this.currentTimeFragment.entityShader, animationTime);
            }
        };
        Rendering.prototype.removeLayers = function (parent) {
            var layers = document.querySelectorAll(".layer");
            for (var i = 0; i < layers.length; i++)
                parent.removeChild(layers[i]);
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
        Rendering.prototype.resizeCanvas = function () {
            var width = window.innerWidth / 2;
            var height = window.innerHeight / 2;
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
            this.uniforms.screenWidth = width;
            this.uniforms.screenHeight = height;
            this.surfaceCorners();
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            var layers = document.querySelectorAll(".layer");
            for (var i = 0; i < layers.length; i++) {
                var el = layers[i];
                el.width = width;
                el.height = height;
                el.style.width = window.innerWidth + 'px';
                el.style.height = window.innerHeight + 'px';
            }
        };
        Rendering.prototype.renderEntities = function (ent, ts) {
            var gl = this.gl;
            this.uniforms.time = ts;
            gl.useProgram(ent.currentProgram);
            gl.uniform1f(ent.uniformsCache.get('bpm'), this.uniforms.bpm);
            gl.uniform1f(ent.uniformsCache.get("freq"), this.uniforms.freq);
            gl.uniform1f(ent.uniformsCache.get("elapsedTime"), ((this.uniforms.time - this.currentTimeFragment.start) / 1000) % 60);
            gl.uniform1f(ent.uniformsCache.get('time'), this.uniforms.time / 1000);
            gl.uniform2f(ent.uniformsCache.get('mouse'), this.uniforms.mouseX, this.uniforms.mouseY);
            gl.uniform2f(ent.uniformsCache.get('resolution'), this.uniforms.screenWidth, this.uniforms.screenHeight);
            gl.bindBuffer(gl.ARRAY_BUFFER, ent.buffer);
            gl.vertexAttribPointer(ent.positionAttribute, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGLbuffer);
            gl.vertexAttribPointer(ent.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, ent.backTarget.texture);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.fftTexture);
            gl.uniform1i(gl.getUniformLocation(ent.currentProgram, "fft"), 0);
            gl.uniform1i(gl.getUniformLocation(ent.currentProgram, "backbuffer"), 1);
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
            var t = (this.uniforms.time - this.currentTimeFragment.start) / 1000 % 60;
            this.onFrame({
                d: ts,
                c: this.animationFrameCount,
                t: t,
                fps: 1000 / (t / this.animationFrameCount)
            });
        };
        return Rendering;
    }());
    Demolished.Rendering = Rendering;
})(Demolished = exports.Demolished || (exports.Demolished = {}));
