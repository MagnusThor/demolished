/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

;
var RenderTarget = (function () {
    function RenderTarget(frameBuffer, renderBuffer, texture) {
        this.frameBuffer = frameBuffer;
        this.renderBuffer = renderBuffer;
        this.texture = texture;
    }
    return RenderTarget;
}());
exports.RenderTarget = RenderTarget;
/**
 *
 *
 * @export
 * @class Graph
 */
var Graph = (function () {
    function Graph() {
    }
    return Graph;
}());
exports.Graph = Graph;
/**
 *
 *
 * @export
 * @class TimeFragment
 */
var TimeFragment = (function () {
    function TimeFragment(entity, start, stop, css3Layers) {
        this.entity = entity;
        this.start = start;
        this.stop = stop;
        if (css3Layers instanceof Array) {
            this.css3Layers = css3Layers;
        }
        else
            this.css3Layers = new Array();
    }
    TimeFragment.prototype.setEntity = function (ent) {
        this.entityShader = ent;
    };
    Object.defineProperty(TimeFragment.prototype, "hasLayers", {
        get: function () {
            return this.css3Layers.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    return TimeFragment;
}());
exports.TimeFragment = TimeFragment;
var CSS3Layer = (function () {
    function CSS3Layer(name, classList) {
        this.name = name;
        this.classList = classList;
    }
    return CSS3Layer;
}());
exports.CSS3Layer = CSS3Layer;
/**
 * Uniforms are global variables  passed to the shaders program's
 *
 * @export
 * @class Uniforms
 */
var Uniforms = (function () {
    function Uniforms(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
    }
    Uniforms.prototype.setScreen = function (w, h) {
        this.screenWidth = w;
        this.screenWidth = h;
    };
    return Uniforms;
}());
exports.Uniforms = Uniforms;
/**
 *
 *
 * @export
 * @class Effect
 */
var Effect = (function () {
    function Effect() {
        this.textures = new Array();
        this.type = 0;
    }
    return Effect;
}());
exports.Effect = Effect;
/**
 *
 *
 * @export
 * @class AudioAnalyzerSettings
 */
var AudioAnalyzerSettings = (function () {
    function AudioAnalyzerSettings(fftSize, smoothingTimeConstant, minDecibels, maxDecibels) {
        this.fftSize = fftSize;
        this.smoothingTimeConstant = smoothingTimeConstant;
        this.minDecibels = minDecibels;
        this.maxDecibels = maxDecibels;
    }
    return AudioAnalyzerSettings;
}());
exports.AudioAnalyzerSettings = AudioAnalyzerSettings;
/**
 *
 *
 * @export
 * @class AudioSettings
 */
var AudioSettings = (function () {
    function AudioSettings() {
    }
    return AudioSettings;
}());
exports.AudioSettings = AudioSettings;
//  "audioSettings": {
//     "audioFile": "song.mp3",
//     "audioAnalyzerSettings":{
//         "fftSize": 8192,
//         "smoothingTimeConstant": 0.85,
//         "minDecibels": -100,
//         "maxDecibels":-30
//     },
//     "duration": 211200,
//     "bmp": 129
// } 


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var demolishedUtils_1 = __webpack_require__(4);
var demolishedEntity_1 = __webpack_require__(3);
var demolishedModels_1 = __webpack_require__(0);
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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var demolished_1 = __webpack_require__(1);
var DemolishedSequencer = (function () {
    function DemolishedSequencer() {
        var _this = this;
        document.addEventListener("keydown", function (evt) {
            console.log("time & freq ", _this.rendering.parameters.time, _this.rendering.parameters.freq);
        });
        this.totalDuration = 249600;
        this.timeLine = document.querySelector(".demolished-timeline input");
        this.timeLine.addEventListener("mousedown", function (evt) {
            _this.rendering.stop();
        });
        this.timeLine.addEventListener("mouseup", function (evt) {
            var ms = parseInt(evt.target.value);
            var s = (ms / 1000) % 60;
            _this.rendering.audio.pause();
            _this.rendering.start(ms);
        });
        this.timeLine.addEventListener("change", function (evt) {
        });
        var canvas = document.querySelector("#gl");
        window.onerror = function () {
            _this.rendering.stop();
        };
        this.rendering = new demolished_1.Demolished.Rendering(canvas, "entities/graph.json");
        this.rendering.onReady = function () {
            var details = _this.rendering.timeFragments.map(function (a, index) {
                return {
                    duration: a.stop - a.start, index: index, description: "foo", name: a.entity };
            });
            _this.getTimeLineDetails(details);
            _this.timeLine.setAttribute("max", _this.totalDuration.toString());
            _this.onReady();
        };
        this.rendering.onStart = function () {
            var p = document.querySelector("#record-canvas");
            if (p.checked) {
                // let videoStream = this.world.canvas["captureStream"](60) as MediaStream;
                // let videoTrack = videoStream.getVideoTracks()[0];
                // let audioTrack = this.world.getAudioTracks()[0];
                // this.recorder = new DemolishedRecorder(videoTrack, audioTrack);
                // this.recorder.start(100);
                console.error("needs to be fixed");
            }
        };
        this.rendering.onFrame = function (frame) {
            var t = frame.ts;
            document.querySelector("#time").textContent =
                ((t / 1000) / 60).toFixed(0).toString() + ":" +
                    ((t / 1000) % 60).toFixed(2).toString();
            if (!_this.pauseUi)
                _this.timeLine.value = frame.ts.toString();
        };
        this.rendering.onStop = function () {
            if (_this.recorder) {
                var recorderNode = document.querySelector("#recording");
                _this.recorder.stop();
                var blob = new Blob(_this.recorder.data, {
                    type: 'video/webm'
                });
                var url = window.URL.createObjectURL(blob);
                var downloadlink = document.createElement('a');
                downloadlink.textContent = "download recording";
                downloadlink.href = url;
                recorderNode.classList.remove("hide");
                recorderNode.appendChild(downloadlink);
            }
        };
    }
    DemolishedSequencer.prototype.onReady = function () { };
    DemolishedSequencer.prototype.getTimeLineDetails = function (arr) {
        var _this = this;
        var parent = document.querySelector(".demolished-timeline");
        var ox = 0;
        arr.forEach(function (ent, index) {
            var el = document.createElement("div");
            el.classList.add("timeline-entry");
            var d = (parseInt(ent.duration) / _this.totalDuration);
            var w = 100 * (Math.round(100 * (d * 1)) / 100);
            el.style.width = w + "%";
            el.style.left = ox + "%";
            el.style.background = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
            var callout = document.createElement("div");
            callout.classList.add("timeline-callout", "hide");
            callout.textContent = ent.name;
            el.addEventListener("mouseenter", function () {
                callout.classList.remove("hide");
            });
            el.addEventListener("mouseleave", function () {
                callout.classList.add("hide");
            });
            el.appendChild(callout);
            parent.appendChild(el);
            ox += w;
        });
    };
    return DemolishedSequencer;
}());
exports.DemolishedSequencer = DemolishedSequencer;
document.addEventListener("DOMContentLoaded", function () {
    var launchButton = document.querySelector("#full-screen");
    function launchFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    var demolished = new DemolishedSequencer();
    window["demo"] = demolished;
    demolished.onReady = function () {
        launchButton.textContent = "Start";
        launchButton.disabled = false;
    };
    launchButton.addEventListener("click", function () {
        launchButton.classList.add("hide");
        demolished.rendering.start(location.hash == "" ? 0 : parseInt(location.hash.substring(1)));
    });
});


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var demolishedModels_1 = __webpack_require__(0);
/**
 *
 *
 * @export
 * @class EntityTexture
 */
var EntityTexture = (function () {
    function EntityTexture(image, name, width, height, assetType) {
        this.image = image;
        this.name = name;
        this.width = width;
        this.height = height;
        this.assetType = assetType;
    }
    return EntityTexture;
}());
exports.EntityTexture = EntityTexture;
var EnityBase = (function () {
    function EnityBase(gl, name, x, y, assets) {
        var _this = this;
        this.gl = gl;
        this.name = name;
        this.x = x;
        this.y = y;
        this.assets = assets;
        this.uniformsCache = new Map();
        this.loadEntityShaders().then(function () {
            _this.initShader();
            _this.target = _this.createRenderTarget(_this.x, _this.y);
            _this.backTarget = _this.createRenderTarget(_this.x, _this.y);
        });
    }
    EnityBase.prototype.createRenderTarget = function (width, height) {
        var gl = this.gl;
        var target = new demolishedModels_1.RenderTarget(gl.createFramebuffer(), gl.createRenderbuffer(), gl.createTexture());
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
    };
    EnityBase.prototype.loadEntityShaders = function () {
        var _this = this;
        var urls = new Array();
        urls.push("entities/" + this.name + "/fragment.glsl");
        urls.push("entities/" + this.name + "/vertex.glsl");
        //  urls.push("entities/" + this.name + "/uniforms.json");
        return Promise.all(urls.map(function (url) {
            return fetch(url).then(function (resp) { return resp.text(); });
        })).then(function (result) {
            _this.fragmetShader = result[0];
            _this.vertexShader = result[1];
            return true;
        }).catch(function (reason) {
            _this.onError(reason);
            return false;
        });
    };
    EnityBase.prototype.onError = function (err) {
        console.error(err);
    };
    EnityBase.prototype.createTextureFromData = function (width, height, image) {
        var gl = this.gl;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    };
    EnityBase.prototype.initShader = function () {
        var _this = this;
        var gl = this.gl;
        this.buffer = gl.createBuffer();
        this.currentProgram = gl.createProgram();
        var vs = this.createShader(gl, this.vertexShader, gl.VERTEX_SHADER);
        var fs = this.createShader(gl, this.fragmetShader, gl.FRAGMENT_SHADER);
        gl.attachShader(this.currentProgram, vs);
        gl.attachShader(this.currentProgram, fs);
        gl.linkProgram(this.currentProgram);
        if (!gl.getProgramParameter(this.currentProgram, gl.LINK_STATUS)) {
            var info = gl.getProgramInfoLog(this.currentProgram);
            this.onError(info);
        }
        this.cacheUniformLocation('bpm');
        this.cacheUniformLocation('freq');
        this.cacheUniformLocation("sampleRate");
        this.cacheUniformLocation("fft");
        this.cacheUniformLocation('time');
        this.cacheUniformLocation('mouse');
        this.cacheUniformLocation('resolution');
        this.positionAttribute = 0; // gl.getAttribLocation(this.currentProgram, "surfacePosAttrib");
        gl.enableVertexAttribArray(this.positionAttribute);
        this.vertexPosition = gl.getAttribLocation(this.currentProgram, "position");
        gl.enableVertexAttribArray(this.vertexPosition);
        this.assets.forEach(function (asset) {
            switch (asset.assetType) {
                case 0:
                    asset.texture = _this.createTextureFromData(asset.width, asset.height, asset.image);
                    break;
                case 1:
                    //  asset.texture = this.createTextureFromFloat32(32,32,new Float32Array(32*32*4));
                    break;
                default:
                    throw "unknown asset type";
            }
        });
        // this.createTextureFromFloat32(1,2,new Float32Array([255,0,0,255]));
        gl.useProgram(this.currentProgram);
    };
    EnityBase.prototype.cacheUniformLocation = function (label) {
        this.uniformsCache.set(label, this.gl.getUniformLocation(this.currentProgram, label));
    };
    EnityBase.prototype.swapBuffers = function () {
        var tmp = this.target;
        this.target = this.backTarget;
        this.backTarget = tmp;
    };
    EnityBase.prototype.createShader = function (gl, src, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
    };
    return EnityBase;
}());
exports.EnityBase = EnityBase;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
    * Utils
    *
    * @export
    * @class Utils
    */
var Utils = (function () {
    function Utils() {
    }
    Utils.getExponentOfTwo = function (value, max) {
        var count = 1;
        do {
            count *= 2;
        } while (count < value);
        if (count > max)
            count = max;
        return count;
    };
    Utils.convertBuffer = function (buffer) {
        var data = new DataView(buffer);
        var tempArray = new Float32Array(1024 * 1024 * 4);
        var len = tempArray.length;
        for (var jj = 0; jj < len; ++jj) {
            tempArray[jj] =
                data.getFloat32(jj * Float32Array.BYTES_PER_ELEMENT, true);
        }
        return tempArray;
    };
    Utils.Audio = {
        getPeaksAtThreshold: function (data, sampleRate, threshold) {
            var peaksArray = new Array();
            var length = data.length;
            var skipRatio = 5;
            for (var i = 0; i < length;) {
                if (data[i] > threshold) {
                    peaksArray.push(i);
                    i += sampleRate / skipRatio;
                }
                i++;
            }
            return peaksArray;
        }
    };
    Utils.Array = {
        add: function (x, y) { return x + y; },
        sum: function (xs) { return xs.reduce(Utils.Array.add, 0); },
        average: function (xs) { return xs[0] === undefined ? NaN : Utils.Array.sum(xs) / xs.length; },
        delta: function (_a) {
            var x = _a[0], xs = _a.slice(1);
            return xs.reduce(function (_a, x) {
                var acc = _a[0], last = _a[1];
                return [acc.concat([x - last]), x];
            }, [[], x])[0];
        }
    };
    return Utils;
}());
exports.Utils = Utils;


/***/ })
/******/ ]);