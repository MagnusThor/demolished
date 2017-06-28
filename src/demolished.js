"use strict";
var demolishedUtils_1 = require('./demolishedUtils');
var demolishedEntity_1 = require('./demolishedEntity');
var demolishedModels_1 = require('./demolishedModels');
var Demolished;
(function (Demolished) {
    var Rendering = (function () {
        function Rendering(canvas, timelineFile) {
            var _this = this;
            this.canvas = canvas;
            this.timelineFile = timelineFile;
            this.width = 1;
            this.height = 1;
            this.centerX = 0;
            this.centerY = 0;
            this.parameters = new demolishedModels_1.Uniforms(this.canvas.width, this.canvas.height);
            this.parameters.time = 0;
            this.parameters.mouseX = 0.5;
            this.parameters.mouseY = 0.5;
            this.entitiesCache = new Array();
            this.timeFragments = new Array();
            this.gl = this.getRendringContext();
            this.fftTexture = this.gl.createTexture();
            this.webGLbuffer = this.gl.createBuffer();
            this.addEventListeners();
            // load and add the entities
            this.loadGraph(this.timelineFile).then(function (graph) {
                console.log(graph);
                var audioSettings = graph.audioSettings;
                graph.timeline.forEach(function (tf) {
                    var _tf = new demolishedModels_1.TimeFragment(tf.entity, tf.start, tf.stop, tf.css3Layers);
                    _this.timeFragments.push(_tf);
                });
                // sort the fragments by start time....
                _this.timeFragments.sort(function (a, b) {
                    return a.start - b.start;
                });
                // todo: pick audio file from graph
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
                    //   this.resizeCanvas();
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
            return fetch(graphFile).then(function (response) {
                return response.json();
            }).then(function (graph) {
                return graph;
            });
        };
        Rendering.prototype.onFrame = function (frame) { };
        Rendering.prototype.onStart = function () { };
        Rendering.prototype.onStop = function () { };
        Rendering.prototype.onReady = function () { };
        // todo:Rename
        Rendering.prototype.getAudioTracks = function () {
            // let ms = this.audio["captureStream"](60)
            // return ms.getAudioTracks();
        };
        Rendering.prototype.createAudio = function (src) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                fetch(src).then(function (resp) {
                    return resp.arrayBuffer().then(function (buffer) {
                        var audioCtx = new AudioContext();
                        audioCtx.decodeAudioData(buffer, function (audioData) {
                            var offlineCtx = new OfflineAudioContext(1, audioData.length, audioData.sampleRate);
                            var filteredSource = offlineCtx.createBufferSource();
                            filteredSource.buffer = audioData; // tell the source which sound to play
                            filteredSource.connect(offlineCtx.destination); // connect the source to the context's destination (the speakers)
                            var filterOffline = offlineCtx.createBiquadFilter();
                            filterOffline.type = 'highpass';
                            filterOffline.Q.value = 2;
                            filterOffline.frequency.value = 2000;
                            // Pipe the song into the filter, and the filter into the offline context
                            filteredSource.connect(filterOffline);
                            filterOffline.connect(offlineCtx.destination);
                            filteredSource.start(0);
                            var source = audioCtx.createBufferSource(); // creates a sound source
                            source.buffer = audioData; // tell the source which sound to play
                            source.connect(audioCtx.destination); // connect the source to the context's destination (the speakers)
                            offlineCtx.startRendering().then(function (renderedBuffer) {
                                var audioCtx = new AudioContext();
                                var audioEl = new Audio(); //document.createElement("audio");
                                audioEl.preload = "auto";
                                audioEl.src = "/assets/song.mp3";
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
                                //  analyser.connect(audioCtx.destination);
                                // bufferSource.connect(analyser);
                                // bufferSource.connect(audioCtx.destination);
                                //  this.audio = bufferSource;
                                _this.peaks = demolishedUtils_1.Utils.Audio.getPeaksAtThreshold(renderedBuffer.getChannelData(0), audioData.sampleRate, 0.21);
                                _this.parameters.bpm = (demolishedUtils_1.Utils.Array.average(demolishedUtils_1.Utils.Array.delta(_this.peaks)) / audioData.sampleRate) * 1000;
                            });
                        });
                    });
                });
            });
        };
        Rendering.prototype.addEventListeners = function () {
            var _this = this;
            document.addEventListener("mousemove", function (evt) {
                _this.parameters.mouseX = evt.clientX / window.innerWidth;
                _this.parameters.mouseY = 1 - evt.clientY / window.innerHeight;
            });
            window.addEventListener("resize", function () {
                _this.resizeCanvas();
            });
        };
        Rendering.prototype.addEntity = function (name, textures) {
            var entity = new demolishedEntity_1.EnityBase(this.gl, name, this.canvas.width, this.canvas.height, textures);
            this.entitiesCache.push(entity);
            // attach to timeLine
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
            if (timeFragment.hasLayers) {
                timeFragment.css3Layers.forEach(function (cssLayer) {
                    var layer = document.createElement("div");
                    layer.id = cssLayer.name;
                    cssLayer.classList.forEach(function (className) {
                        layer.classList.add(className);
                    });
                    layer.innerHTML = cssLayer.markup;
                    layer.classList.add("layer");
                    parent.appendChild(layer);
                });
            }
            return timeFragment;
        };
        Rendering.prototype.start = function (time) {
            this.animationOffsetTime = time;
            this.currentTimeFragment = this.tryFindTimeFragment(time);
            this.animationStartTime = performance.now();
            this.animate(time);
            this.audio.currentTime = (time / 1000) % 60;
            this.audio.play();
            this.onStart();
        };
        Rendering.prototype.autoCorrelateFloat = function (buf, sampleRate) {
            var MIN_SAMPLES = 4; // corresponds to an 11kHz signal
            var MAX_SAMPLES = 1000; // corresponds to a 44Hz signal
            var SIZE = 1000;
            var best_offset = -1;
            var best_correlation = 0;
            var rms = 0;
            if (buf.length < (SIZE + MAX_SAMPLES - MIN_SAMPLES))
                return -1; // Not enough data
            for (var i = 0; i < SIZE; i++)
                rms += buf[i] * buf[i];
            rms = Math.sqrt(rms / SIZE);
            for (var offset = MIN_SAMPLES; offset <= MAX_SAMPLES; offset++) {
                var correlation = 0;
                for (var i = 0; i < SIZE; i++) {
                    correlation += Math.abs(buf[i] - buf[i + offset]);
                }
                correlation = 1 - (correlation / SIZE);
                if (correlation > best_correlation) {
                    best_correlation = correlation;
                    best_offset = offset;
                }
            }
            if ((rms > 0.1) && (best_correlation > 0.1)) {
                //     console.log("f = " + sampleRate / best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")");
                return sampleRate / best_offset;
            }
            else
                return -1;
            //   return sampleRate/best_offset;
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
                this.parameters.freq = demolishedUtils_1.Utils.Array.average(freqArray);
                // for debug-purpose
                var fEl = document.querySelector("#freq");
                fEl.textContent = Math.round(this.parameters.freq).toString();
            }
            // todo: Make this Entities an Map<EntityBase>
            //  let entity: EnityBase = this.entities[this.currentEntity];
            // if(!entity) throw "Could not find the entity " + this.currentEntity;
            if (animationTime >= this.currentTimeFragment.stop) {
                this.currentTimeFragment = this.tryFindTimeFragment(time);
            }
            this.renderEntities(this.currentTimeFragment.entityShader, animationTime);
        };
        Rendering.prototype.removeLayers = function (parent) {
            var layers = document.querySelectorAll(".layer");
            console.log("removing nodes ->", layers.length);
            for (var i = 0; i < layers.length; i++)
                parent.removeChild(layers[i]);
        };
        Rendering.prototype.surfaceCorners = function () {
            if (this.gl) {
                this.width = this.height * this.parameters.screenWidth / this.parameters.screenHeight;
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
            this.parameters.screenWidth = width;
            this.parameters.screenHeight = height;
            this.surfaceCorners();
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            var layers = document.querySelectorAll(".layer");
            for (var i = 0; i < layers.length; i++) {
                //console.log(layers[i]);
                var el = layers[i];
                el.width = width;
                el.height = height;
                el.style.width = window.innerWidth + 'px';
                el.style.height = window.innerHeight + 'px';
            }
        };
        Rendering.prototype.renderEntities = function (ent, ts) {
            var gl = this.gl;
            this.parameters.time = ts; // Date.now() - this.parameters.startTime;
            gl.useProgram(ent.currentProgram);
            gl.uniform1f(ent.uniformsCache.get('bpm'), this.parameters.bpm);
            gl.uniform1f(ent.uniformsCache.get("freq"), this.parameters.freq);
            gl.uniform1f(ent.uniformsCache.get('time'), this.parameters.time / 1000);
            gl.uniform2f(ent.uniformsCache.get('mouse'), this.parameters.mouseX, this.parameters.mouseY);
            gl.uniform2f(ent.uniformsCache.get('resolution'), this.parameters.screenWidth, this.parameters.screenHeight);
            gl.bindBuffer(gl.ARRAY_BUFFER, ent.buffer);
            gl.vertexAttribPointer(ent.positionAttribute, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGLbuffer);
            gl.vertexAttribPointer(ent.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, ent.backTarget.texture);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.fftTexture);
            // Should be fftSampler
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
            this.onFrame({
                ts: this.animationOffsetTime + ts,
                raflId: this.animationFrameId
            });
        };
        return Rendering;
    }());
    Demolished.Rendering = Rendering;
})(Demolished = exports.Demolished || (exports.Demolished = {}));
