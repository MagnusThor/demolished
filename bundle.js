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
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var BaseEntity2D = (function () {
    function BaseEntity2D(name, ctx) {
        this.name = name;
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
    }
    BaseEntity2D.prototype.update = function (t) {
    };
    return BaseEntity2D;
}());
exports.BaseEntity2D = BaseEntity2D;
var DemolishedCanvas = (function () {
    function DemolishedCanvas(canvas) {
        this.canvas = canvas;
        this.entities = new Array();
        this.ctx = canvas.getContext("2d");
        this.animationStartTime = 0;
        this.resizeCanvas();
    }
    DemolishedCanvas.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    };
    DemolishedCanvas.prototype.animate = function (time) {
        var _this = this;
        var animationTime = time - this.animationStartTime;
        this.animationFrameId = requestAnimationFrame(function (_time) {
            _this.animate(_time);
        });
        this.renderEntities(time);
    };
    DemolishedCanvas.prototype.addEntity = function (ent) {
        this.entities.push(ent);
    };
    DemolishedCanvas.prototype.resizeCanvas = function () {
        var width = window.innerWidth / 2;
        var height = window.innerHeight / 2;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    };
    DemolishedCanvas.prototype.renderEntities = function (time) {
        this.clear();
        this.entities.forEach(function (ent) {
            ent.update(time);
        });
    };
    DemolishedCanvas.prototype.start = function (startTime) {
        this.animate(startTime);
    };
    return DemolishedCanvas;
}());
exports.DemolishedCanvas = DemolishedCanvas;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function loadResource(file) {
    var promise = new Promise(function (resolve, reject) {
        var wrapper = new XMLHttpRequestWrapper(file, resolve, reject);
        return wrapper;
    });
    return promise;
}
exports.default = loadResource;
var XMLHttpRequestWrapper = (function () {
    function XMLHttpRequestWrapper(file, resolve, reject) {
        this.file = file;
        var xhr = new XMLHttpRequest();
        xhr.open("GET", file);
        xhr.responseType = "blob";
        xhr.onloadend = function (evt) {
            try {
                if (xhr.status == 404)
                    throw "failed to loadResource " + file;
                resolve(new ResponseWrapper(xhr.response));
            }
            catch (err) {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = function (err) {
            reject(err);
        };
        xhr.send();
        this.xhr = xhr;
    }
    return XMLHttpRequestWrapper;
}());
var ResponseWrapper = (function () {
    function ResponseWrapper(blobData) {
        this.blobData = blobData;
    }
    ResponseWrapper.prototype.arrayBuffer = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.readAsArrayBuffer(_this.blobData);
        });
    };
    ResponseWrapper.prototype.blob = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            resolve(_this.blobData);
        });
    };
    ResponseWrapper.prototype.text = function () {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                resolve(reader.result);
            };
            reader.readAsText(_this.blobData);
        });
        return promise;
    };
    ResponseWrapper.prototype.json = function () {
        var _this = this;
        var promise = new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                resolve(JSON.parse(reader.result));
            };
            reader.readAsText(_this.blobData);
        });
        return promise;
    };
    return ResponseWrapper;
}());
exports.ResponseWrapper = ResponseWrapper;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
;
var demolishedTransitions_1 = __webpack_require__(8);
var RenderTarget = (function () {
    function RenderTarget(frameBuffer, renderBuffer, texture) {
        this.frameBuffer = frameBuffer;
        this.renderBuffer = renderBuffer;
        this.texture = texture;
    }
    return RenderTarget;
}());
exports.RenderTarget = RenderTarget;
var Graph = (function () {
    function Graph() {
    }
    return Graph;
}());
exports.Graph = Graph;
var TimeFragment = (function () {
    function TimeFragment(entity, start, stop, useTransitions, overlays) {
        this.entity = entity;
        this.start = start;
        this.stop = stop;
        this.useTransitions = useTransitions;
        if (overlays instanceof Array) {
            this.overlays = overlays;
        }
        else
            this.overlays = new Array();
    }
    TimeFragment.prototype.setEntity = function (ent) {
        this.entityShader = ent;
        if (this.useTransitions) {
            this.transition = new demolishedTransitions_1.DemloshedTransitionBase(this.entityShader);
        }
    };
    Object.defineProperty(TimeFragment.prototype, "hasLayers", {
        get: function () {
            return this.overlays.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    return TimeFragment;
}());
exports.TimeFragment = TimeFragment;
var Overlay = (function () {
    function Overlay(name, classList) {
        this.name = name;
        this.classList = classList;
    }
    return Overlay;
}());
exports.Overlay = Overlay;
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
var Effect = (function () {
    function Effect() {
        this.textures = new Array();
        this.type = 0;
    }
    return Effect;
}());
exports.Effect = Effect;
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
var AudioSettings = (function () {
    function AudioSettings() {
    }
    return AudioSettings;
}());
exports.AudioSettings = AudioSettings;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var demolishedCanvas_1 = __webpack_require__(0);
var Scroller2D = (function (_super) {
    __extends(Scroller2D, _super);
    function Scroller2D(ctx, text) {
        var _this = _super.call(this, "scroller", ctx) || this;
        _this.text = text;
        _this.textWidth = 0;
        _this.y = 10;
        _this.x = 0;
        _this.font = "64px 'DoubletwoStudiosXXIIBlackmetalWarrior'";
        _this.x = ctx.canvas.width;
        ctx.fillStyle = "#FFFFFF";
        _this.velocity = 3;
        _this.textWidth = (ctx.measureText(_this.text).width);
        _this.active = true;
        _this.y = ctx.canvas.height - 24;
        return _this;
    }
    Scroller2D.prototype.update = function (time) {
        this.x -= this.velocity;
        this.ctx.font = this.font;
        this.ctx.fillText(this.text, this.x, this.y);
    };
    return Scroller2D;
}(demolishedCanvas_1.BaseEntity2D));
exports.Scroller2D = Scroller2D;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DemolishedTrans = (function () {
    function DemolishedTrans(parentEl, graph) {
        this.parentEl = parentEl;
        this.graph = graph;
        this.parent = document.querySelector(parentEl);
    }
    DemolishedTrans.prototype.createTimeout = function (name, start, classes) {
        var _this = this;
        var i = setTimeout(function () {
            classes.forEach(function (cssClass) {
                _this.parent.classList.add(cssClass);
            });
            _this.parent.addEventListener("animationend", function () {
                _this.parent.classList.remove(classes);
            });
        }, start);
    };
    DemolishedTrans.prototype.start = function (n) {
        var _this = this;
        this.graph.timeLine.forEach(function (el, i) {
            _this.createTimeout(el.name, el.start, el.classes);
        });
    };
    return DemolishedTrans;
}());
exports.DemolishedTrans = DemolishedTrans;
var Trans = (function () {
    function Trans() {
    }
    return Trans;
}());
exports.Trans = Trans;


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var demolishedUtils_1 = __webpack_require__(9);
var demolishedEntity_1 = __webpack_require__(7);
var demolishedModels_1 = __webpack_require__(2);
var demolishedLoader_1 = __webpack_require__(1);
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


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var demolished_1 = __webpack_require__(5);
var demolishedCanvas_1 = __webpack_require__(0);
var scroller_1 = __webpack_require__(3);
var demolihedTrans_1 = __webpack_require__(4);
var scrollText = "This is fucking it, we love and support sami terrorism but hate everyting else, maybe we can save an artic fox just because it is evil. Barbie is fucking wasted on norrlaendskt haembrant and russian krokodil.  Speedfisters is going to die by our knife. Norrland is filling our souls with the deepest insanity and hate towards everything that can die. Spraeng bort allt soeder om Dalaelven! Djaevla mesar!   Fuck this shit! It's time to go out in the northern wilderness and become one with all the fucking insane bears and wolves. All that will be left is bloody corpses, ready for nature to fuck with all it's satanic evil.  btw, fuck a raindeer.  spitvaelling and blodkams!        ";
var HCHDemo = (function () {
    function HCHDemo() {
        var _this = this;
        this.transitions = new demolihedTrans_1.DemolishedTrans("#trans", { timeLine: [
                {
                    name: "intro",
                    classes: ["elk",],
                    start: 12500
                },
                {
                    name: "skog",
                    classes: ["elk"],
                    start: 28500
                },
                {
                    name: "blod",
                    classes: ["elk"],
                    start: 42500
                },
                {
                    name: "ren",
                    classes: ["elk"],
                    start: 55750
                },
                {
                    name: "hund",
                    classes: ["elk"],
                    start: 87500
                }
            ]
        });
        var webGlCanvas = document.querySelector("#webgl");
        var canavs2d = document.querySelector("#simpleCanvas");
        this.canvasRendering = new demolishedCanvas_1.DemolishedCanvas(canavs2d);
        this.canvasRendering.addEntity(new scroller_1.Scroller2D(this.canvasRendering.ctx, scrollText));
        this.webGlrendering = new demolished_1.Demolished.Rendering(webGlCanvas, "entities/graph.json", this.canvasRendering);
        this.webGlrendering.onReady = function () {
            _this.onReady();
            window.setTimeout(function () {
                document.querySelector(".loader").classList.add("hide");
                _this.webGlrendering.start(0);
                window.setTimeout(function () {
                    _this.canvasRendering.start(0);
                }, 105 * 1000);
                _this.transitions.start(0);
            }, 2000);
        };
        this.webGlrendering.onStop = function () {
        };
        this.webGlrendering.onStart = function () {
        };
        this.webGlrendering.onNext = function (frameInfo) {
        };
        window.onerror = function () {
            _this.webGlrendering.stop();
        };
        document.addEventListener("keyup", function (e) {
            if (e.keyCode === 13)
                console.log(_this.webGlrendering.uniforms);
        });
    }
    HCHDemo.prototype.onReady = function () { };
    return HCHDemo;
}());
exports.HCHDemo = HCHDemo;
document.addEventListener("DOMContentLoaded", function () {
    var demo = new HCHDemo();
});


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var demolishedModels_1 = __webpack_require__(2);
var demolishedLoader_1 = __webpack_require__(1);
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
var EntityBase = (function () {
    function EntityBase(gl, name, x, y, assets) {
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
    EntityBase.prototype.createRenderTarget = function (width, height) {
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
    EntityBase.prototype.loadEntityShaders = function () {
        var _this = this;
        var urls = new Array();
        urls.push("entities/" + this.name + "/fragment.glsl");
        urls.push("entities/" + this.name + "/vertex.glsl");
        return Promise.all(urls.map(function (url) {
            return demolishedLoader_1.default(url).then(function (resp) { return resp.text(); });
        })).then(function (result) {
            _this.fragmetShader = result[0];
            _this.vertexShader = result[1];
            return true;
        }).catch(function (reason) {
            _this.onError(reason);
            return false;
        });
    };
    EntityBase.prototype.onError = function (err) {
        console.error(err);
    };
    EntityBase.prototype.createTextureFromData = function (width, height, image) {
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
    EntityBase.prototype.initShader = function () {
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
        this.cacheUniformLocation("elapsedTime");
        this.cacheUniformLocation('mouse');
        this.cacheUniformLocation('resolution');
        this.cacheUniformLocation("backbuffer");
        this.positionAttribute = 0;
        gl.enableVertexAttribArray(this.positionAttribute);
        this.vertexPosition = gl.getAttribLocation(this.currentProgram, "position");
        gl.enableVertexAttribArray(this.vertexPosition);
        this.assets.forEach(function (asset) {
            switch (asset.assetType) {
                case 0:
                    asset.texture = _this.createTextureFromData(asset.width, asset.height, asset.image);
                    break;
                case 1:
                    break;
                default:
                    throw "unknown asset type";
            }
        });
        gl.useProgram(this.currentProgram);
    };
    EntityBase.prototype.cacheUniformLocation = function (label) {
        this.uniformsCache.set(label, this.gl.getUniformLocation(this.currentProgram, label));
    };
    EntityBase.prototype.swapBuffers = function () {
        var tmp = this.target;
        this.target = this.backTarget;
        this.backTarget = tmp;
    };
    EntityBase.prototype.createShader = function (gl, src, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
    };
    return EntityBase;
}());
exports.EntityBase = EntityBase;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DemloshedTransitionBase = (function () {
    function DemloshedTransitionBase(entity) {
        this.entity = entity;
    }
    DemloshedTransitionBase.prototype.fadeIn = function (time) {
        return null;
    };
    DemloshedTransitionBase.prototype.fadeOut = function (time) {
        return;
    };
    return DemloshedTransitionBase;
}());
exports.DemloshedTransitionBase = DemloshedTransitionBase;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
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