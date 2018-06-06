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
/******/ 	return __webpack_require__(__webpack_require__.s = 38);
/******/ })
/************************************************************************/
/******/ ({

/***/ 1:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
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
var Graph = (function () {
    function Graph() {
    }
    return Graph;
}());
exports.Graph = Graph;
var TimeFragment = (function () {
    function TimeFragment(entity, start, stop, subeffects) {
        this.entity = entity;
        this.start = start;
        this.stop = stop;
        subeffects ? this.subeffects = subeffects : this.subeffects = new Array();
        this._subeffects = this.subeffects.map(function (a) { return a; });
    }
    TimeFragment.prototype.reset = function () {
        this.subeffects = this._subeffects.map(function (a) { return a; });
        console.log(this.subeffects);
    };
    TimeFragment.prototype.setEntity = function (ent) {
        this.entityShader = ent;
    };
    TimeFragment.prototype.init = function () {
        var _this = this;
        this.subeffects.forEach(function (interval) {
            var shader = _this.entityShader;
            shader.addAction("$subeffects", function (ent, tm) {
                if (_this.subeffects.find(function (a) { return a <= tm; })) {
                    ent.subEffectId++;
                    _this.subeffects.shift();
                    console.log("initializing", _this.subeffects, shader.subEffectId, tm);
                }
            });
        });
    };
    return TimeFragment;
}());
exports.TimeFragment = TimeFragment;
var Uniforms = (function () {
    function Uniforms(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.time = 0;
        this.timeTotal = 0;
        this.mouseX = 0.5;
        this.mouseY = 0.5;
    }
    Object.defineProperty(Uniforms.prototype, "datetime", {
        get: function () {
            var d = new Date();
            return [d.getFullYear(), d.getMonth(), d.getDate(),
                d.getHours() * 60.0 * 60 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000.0];
        },
        enumerable: true,
        configurable: true
    });
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
    function AudioSettings(audioFile, audioAnalyzerSettings, duration, bpm) {
        this.audioAnalyzerSettings = audioAnalyzerSettings;
        this.bpm = bpm;
        this.audioFile;
        this.duration = duration;
    }
    return AudioSettings;
}());
exports.AudioSettings = AudioSettings;


/***/ }),

/***/ 2:
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

/***/ 3:
/***/ (function(module, exports, __webpack_require__) {

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
var demolishedEntity_1 = __webpack_require__(4);
var demolishedModels_1 = __webpack_require__(1);
var demolishedLoader_1 = __webpack_require__(2);
var demolishedProperties_1 = __webpack_require__(9);
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
            this.addEventListeners();
            if (this.timelineFile != "") {
                this.loadGraph(this.timelineFile).then(function (graph) {
                    var audioSettings = graph.audioSettings;
                    graph.timeline.forEach(function (tf) {
                        var _tf = new demolishedModels_1.TimeFragment(tf.entity, tf.start, tf.stop, tf.subeffects);
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
            var entity = new demolishedEntity_1.ShaderEntity(this.gl, name, this.canvas.width, this.canvas.height, textures);
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
            gl.activeTexture(gl.TEXTURE0 + (2 + c));
            gl.bindTexture(gl.TEXTURE_2D, entityTexture.texture);
            gl.uniform1i(gl.getUniformLocation(ent.glProgram, entityTexture.name), 2 + c);
        };
        __decorate([
            demolishedProperties_1.Observe(true),
            __metadata("design:type", Object)
        ], Rendering.prototype, "uniforms", void 0);
        return Rendering;
    }());
    Demolished.Rendering = Rendering;
})(Demolished = exports.Demolished || (exports.Demolished = {}));


/***/ }),

/***/ 33:
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
var demolishedSound_1 = __webpack_require__(5);
var DemolishedSonant = (function (_super) {
    __extends(DemolishedSonant, _super);
    function DemolishedSonant(song) {
        var _this = _super.call(this) || this;
        _this.song = song;
        _this.WAVE_SPS = 44100;
        _this.WAVE_CHAN = 2;
        _this.generate = function (track) {
            var oscillators = [
                this.osc_sin,
                this.osc_square,
                this.osc_saw,
                this.osc_tri
            ];
            var i, j, k, b, p, row, n, currentpos, cp, c1, c2, q, low, band, high, t, lfor, e, x, rsample, f, da, o1t, o2t;
            var chnBuf = this.chnBufWork, mixBuf = this.mixBufWork, waveSamples = this.WAVE_SIZE, waveBytes = this.WAVE_SIZE * this.WAVE_CHAN * 2, instr = this.song.songData[track], rowLen = this.song.rowLen, osc_lfo = oscillators[instr.lfo_waveform], osc1 = oscillators[instr.osc1_waveform], osc2 = oscillators[instr.osc2_waveform], attack = instr.env_attack, sustain = instr.env_sustain, release = instr.env_release, panFreq = Math.pow(2, instr.fx_pan_freq - 8) / rowLen, lfoFreq = Math.pow(2, instr.lfo_freq - 8) / rowLen;
            for (b = 0; b < waveBytes; b += 2) {
                chnBuf[b] = 0;
                chnBuf[b + 1] = 128;
            }
            currentpos = 0;
            for (p = 0; p < this.song.endPattern - 1; ++p) {
                cp = instr.p[p];
                for (row = 0; row < 32; ++row) {
                    if (cp) {
                        n = instr.c[cp - 1].n[row];
                        if (n) {
                            c1 = c2 = 0;
                            o1t = this.getnotefreq(n + (instr.osc1_oct - 8) * 12 + instr.osc1_det) * (1 + 0.0008 * instr.osc1_detune);
                            o2t = this.getnotefreq(n + (instr.osc2_oct - 8) * 12 + instr.osc2_det) * (1 + 0.0008 * instr.osc2_detune);
                            q = instr.fx_resonance / 255;
                            low = band = 0;
                            for (j = attack + sustain + release - 1; j >= 0; --j) {
                                k = j + currentpos;
                                lfor = osc_lfo(k * lfoFreq) * instr.lfo_amt / 512 + 0.5;
                                e = 1;
                                if (j < attack)
                                    e = j / attack;
                                else if (j >= attack + sustain)
                                    e -= (j - attack - sustain) / release;
                                t = o1t;
                                if (instr.lfo_osc1_freq)
                                    t += lfor;
                                if (instr.osc1_xenv)
                                    t *= e * e;
                                c1 += t;
                                rsample = osc1(c1) * instr.osc1_vol;
                                t = o2t;
                                if (instr.osc2_xenv)
                                    t *= e * e;
                                c2 += t;
                                rsample += osc2(c2) * instr.osc2_vol;
                                if (instr.noise_fader)
                                    rsample += (2 * Math.random() - 1) * instr.noise_fader * e;
                                rsample *= e / 255;
                                f = instr.fx_freq;
                                if (instr.lfo_fx_freq)
                                    f *= lfor;
                                f = 1.5 * Math.sin(f * 3.141592 / this.WAVE_SPS);
                                low += f * band;
                                high = q * (rsample - band) - low;
                                band += f * high;
                                switch (instr.fx_filter) {
                                    case 1:
                                        rsample = high;
                                        break;
                                    case 2:
                                        rsample = low;
                                        break;
                                    case 3:
                                        rsample = band;
                                        break;
                                    case 4:
                                        rsample = low + high;
                                    default:
                                }
                                t = this.osc_sin(k * panFreq) * instr.fx_pan_amt / 512 + 0.5;
                                rsample *= 39 * instr.env_master;
                                k <<= 2;
                                x = chnBuf[k] + (chnBuf[k + 1] << 8) + rsample * (1 - t);
                                chnBuf[k] = x & 255;
                                chnBuf[k + 1] = (x >> 8) & 255;
                                x = chnBuf[k + 2] + (chnBuf[k + 3] << 8) + rsample * t;
                                chnBuf[k + 2] = x & 255;
                                chnBuf[k + 3] = (x >> 8) & 255;
                            }
                        }
                    }
                    currentpos += rowLen;
                }
            }
            p = (instr.fx_delay_time * rowLen) >> 1;
            t = instr.fx_delay_amt / 255;
            for (n = 0; n < waveSamples - p; ++n) {
                b = 4 * n;
                k = 4 * (n + p);
                x = chnBuf[k] + (chnBuf[k + 1] << 8) +
                    (chnBuf[b + 2] + (chnBuf[b + 3] << 8) - 32768) * t;
                chnBuf[k] = x & 255;
                chnBuf[k + 1] = (x >> 8) & 255;
                x = chnBuf[k + 2] + (chnBuf[k + 3] << 8) +
                    (chnBuf[b] + (chnBuf[b + 1] << 8) - 32768) * t;
                chnBuf[k + 2] = x & 255;
                chnBuf[k + 3] = (x >> 8) & 255;
            }
            for (b = 0; b < waveBytes; b += 2) {
                x = mixBuf[b] + (mixBuf[b + 1] << 8) + chnBuf[b] + (chnBuf[b + 1] << 8) - 32768;
                mixBuf[b] = x & 255;
                mixBuf[b + 1] = (x >> 8) & 255;
            }
        };
        _this.WAVE_SIZE = _this.WAVE_SPS * song.songLen;
        var size = Math.ceil(Math.sqrt(_this.WAVE_SIZE * _this.WAVE_CHAN / 2));
        var ctx = document.createElement('canvas').getContext('2d');
        _this.chnBufWork = ctx.createImageData(size, size).data;
        var b, mixBuf = ctx.createImageData(size, size).data;
        for (b = size * size * 4 - 2; b >= 0; b -= 2) {
            mixBuf[b] = 0;
            mixBuf[b + 1] = 128;
        }
        _this.mixBufWork = mixBuf;
        return _this;
    }
    DemolishedSonant.prototype.createAudio = function (settings) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var b, k, x, wave, l1, l2, s, y;
            var mixBuf = _this.mixBufWork, waveBytes = _this.WAVE_SIZE * _this.WAVE_CHAN * 2;
            _this.chnBufWork = null;
            l1 = waveBytes - 8;
            l2 = l1 - 36;
            wave = String.fromCharCode(82, 73, 70, 70, l1 & 255, (l1 >> 8) & 255, (l1 >> 16) & 255, (l1 >> 24) & 255, 87, 65, 86, 69, 102, 109, 116, 32, 16, 0, 0, 0, 1, 0, 2, 0, 68, 172, 0, 0, 16, 177, 2, 0, 4, 0, 16, 0, 100, 97, 116, 97, l2 & 255, (l2 >> 8) & 255, (l2 >> 16) & 255, (l2 >> 24) & 255);
            for (b = 0; b < waveBytes;) {
                x = "";
                for (k = 0; k < 256 && b < waveBytes; ++k, b += 2) {
                    y = 4 * (mixBuf[b] + (mixBuf[b + 1] << 8) - 32768);
                    y = y < -32768 ? -32768 : (y > 32767 ? 32767 : y);
                    x += String.fromCharCode(y & 255, (y >> 8) & 255);
                }
                wave += x;
            }
            s = "data:audio/wav;base64," + btoa(wave);
            wave = null;
            var audioCtx = new AudioContext();
            var audioEl = new Audio();
            audioEl.preload = "auto";
            audioEl.crossOrigin = "anonymous";
            audioEl.src = s;
            var onLoad = function () {
                var source = audioCtx.createMediaElementSource(audioEl);
                var analyser = audioCtx.createAnalyser();
                analyser.smoothingTimeConstant = 0.85;
                analyser.fftSize = 8192;
                _this.audio = audioEl;
                source.connect(analyser);
                analyser.connect(audioCtx.destination);
                _this.audioAnalyser = analyser;
                resolve(true);
            };
            onLoad();
        });
    };
    DemolishedSonant.prototype.play = function () {
        this.audio.play();
    };
    DemolishedSonant.prototype.stop = function () {
        this.audio.pause();
    };
    DemolishedSonant.prototype.mute = function (ismuted) {
        this.audio.muted = ismuted;
    };
    Object.defineProperty(DemolishedSonant.prototype, "currentTime", {
        get: function () {
            return this.audio.currentTime;
        },
        set: function (time) {
            this.audio.currentTime = time;
        },
        enumerable: true,
        configurable: true
    });
    DemolishedSonant.prototype.getTracks = function () {
        throw "not yet implemented";
    };
    DemolishedSonant.prototype.getFrequenceData = function () {
        var bufferLength = this.audioAnalyser.frequencyBinCount;
        var freqArray = new Uint8Array(bufferLength);
        this.audioAnalyser.getByteFrequencyData(freqArray);
        return freqArray;
    };
    DemolishedSonant.prototype.osc_sin = function (value) {
        return Math.sin(value * 6.283184);
    };
    DemolishedSonant.prototype.osc_square = function (value) {
        if (this.osc_sin(value) < 0)
            return -1;
        return 1;
    };
    DemolishedSonant.prototype.osc_saw = function (value) {
        return (value % 1) - 0.5;
    };
    DemolishedSonant.prototype.osc_tri = function (value) {
        var v2 = (value % 1) * 4;
        if (v2 < 2)
            return v2 - 1;
        return 3 - v2;
    };
    DemolishedSonant.prototype.getnotefreq = function (n) {
        return 0.00390625 * Math.pow(1.059463094, n - 128);
    };
    DemolishedSonant.prototype.getData = function (t, n) {
        for (var i = Math.floor(t * this.WAVE_SPS), j = 0, d = [], b = this.mixBufWork; j < 2 * n; j += 2) {
            var k = 4 * (i + j) + 1;
            d.push(t > 0 && k < b.length ? (b[k] + b[k - 1] / 256) / 256 : 0.5);
        }
        return d;
    };
    ;
    return DemolishedSonant;
}(demolishedSound_1.DemolishedSoundBase));
exports.DemolishedSonant = DemolishedSonant;
var DemolishedSoundBox = (function (_super) {
    __extends(DemolishedSoundBox, _super);
    function DemolishedSoundBox() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DemolishedSoundBox.prototype.getTracks = function () {
        throw "not yet implemented";
    };
    DemolishedSoundBox.prototype.createAudio = function (settings) {
        throw new Error("Method not implemented.");
    };
    DemolishedSoundBox.prototype.play = function (tm) {
        throw new Error("Method not implemented.");
    };
    DemolishedSoundBox.prototype.stop = function (tm) {
        throw new Error("Method not implemented.");
    };
    DemolishedSoundBox.prototype.mute = function (ismuted) {
        throw new Error("Method not implemented.");
    };
    DemolishedSoundBox.prototype.getFrequenceData = function () {
        throw new Error("Method not implemented.");
    };
    return DemolishedSoundBox;
}(demolishedSound_1.DemolishedSoundBase));
exports.DemolishedSoundBox = DemolishedSoundBox;


/***/ }),

/***/ 38:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var demolished_1 = __webpack_require__(3);
var DemolishedSonant_1 = __webpack_require__(33);
var Demo = (function () {
    function Demo() {
        var _this = this;
        var webGlCanvas = document.querySelector("#webgl");
        var music = new DemolishedSonant_1.DemolishedSonant(window["song"]);
        for (var t = 0; t < 8; t++)
            music.generate(t);
        ;
        this.webGlrendering = new demolished_1.Demolished.Rendering(webGlCanvas, document.querySelector("#shader-view"), "entities/graph.json", music);
        this.webGlrendering.onFrame = function (frame) {
        };
        this.webGlrendering.onReady = function () {
            _this.onReady();
            window.setTimeout(function () {
                document.querySelector(".loader").classList.add("hide");
                _this.webGlrendering.resizeCanvas(document.querySelector("#shader-view"), 2);
                _this.webGlrendering.start(0);
            }, 5000);
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
    }
    Demo.prototype.onReady = function () { };
    Demo.getIntance = function () {
        return new this();
    };
    return Demo;
}());
exports.Demo = Demo;
document.addEventListener("DOMContentLoaded", function () {
    Demo.getIntance();
});


/***/ }),

/***/ 4:
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
var demolishedModels_1 = __webpack_require__(1);
var demolishedLoader_1 = __webpack_require__(2);
var DemolishedShaderResource = (function () {
    function DemolishedShaderResource() {
        throw "not yet mimplamented";
    }
    return DemolishedShaderResource;
}());
exports.DemolishedShaderResource = DemolishedShaderResource;
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
    function EntityBase(gl) {
        this.gl = gl;
        this.actions = new Map();
    }
    EntityBase.prototype.cacheUniformLocation = function (label) {
        this.uniformsCache.set(label, this.gl.getUniformLocation(this.glProgram, label));
    };
    return EntityBase;
}());
exports.EntityBase = EntityBase;
var ShaderEntity = (function (_super) {
    __extends(ShaderEntity, _super);
    function ShaderEntity(gl, name, w, h, textures) {
        var _this = _super.call(this, gl) || this;
        _this.gl = gl;
        _this.name = name;
        _this.w = w;
        _this.h = h;
        _this.textures = textures;
        _this.uniformsCache = new Map();
        _this.loadShaders().then(function (numOfShaders) {
            if (numOfShaders > -1) {
                _this.initShader();
                _this.target = _this.createRenderTarget(_this.w, _this.h);
                _this.backTarget = _this.createRenderTarget(_this.w, _this.h);
            }
        });
        return _this;
    }
    ShaderEntity.prototype.addBuffer = function (key) {
        throw "Not yet implemented";
    };
    ShaderEntity.prototype.render = function (engine) {
        var gl = this.gl;
        var ent = this;
        gl.uniform1f(ent.uniformsCache.get('time'), engine.uniforms.time / 1000.);
        gl.uniform1f(ent.uniformsCache.get("timetotal"), engine.uniforms.timeTotal / 1000.);
        gl.uniform4fv(ent.uniformsCache.get("datetime"), engine.uniforms.datetime);
        gl.uniform1f(ent.uniformsCache.get("playbacktime"), engine.audio.currentTime);
        gl.uniform1i(ent.uniformsCache.get("frameId"), engine.animationFrameCount);
        gl.uniform1i(ent.uniformsCache.get("subEffectId"), ent.subEffectId);
        gl.uniform2f(ent.uniformsCache.get("mouse"), engine.uniforms.mouseX, engine.uniforms.mouseY);
        gl.uniform2f(ent.uniformsCache.get("resolution"), engine.uniforms.screenWidth, engine.uniforms.screenHeight);
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
        ent.textures.forEach(function (asset, index) {
            engine.bindTexture(ent, asset, index);
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, ent.target.frameBuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        ent.swapBuffers();
        ent.runAction("$subeffects", engine.uniforms.time / 1000);
    };
    ShaderEntity.prototype.addAction = function (key, fn) {
        this.actions.set(key, fn);
    };
    ShaderEntity.prototype.runAction = function (key, tm) {
        try {
            this.actions.get(key)(this, tm);
        }
        catch (_a) {
            console.warn(this);
        }
    };
    ShaderEntity.prototype.removeAction = function (key) {
        return this.actions.delete(key);
    };
    Object.defineProperty(ShaderEntity.prototype, "vertexHeader", {
        get: function () {
            var header = "";
            header += "#version 300 es\n" +
                "#ifdef GL_ES\n" +
                "precision highp float;\n" +
                "precision highp int;\n" +
                "precision mediump sampler3D;\n" +
                "#endif\n";
            return header;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ShaderEntity.prototype, "fragmentHeader", {
        get: function () {
            var header = "";
            header += "#version 300 es\n" +
                "#ifdef GL_ES\n" +
                "precision highp float;\n" +
                "precision highp int;\n" +
                "precision mediump sampler3D;\n" +
                "#endif\n";
            return header;
        },
        enumerable: true,
        configurable: true
    });
    ShaderEntity.prototype.reset = function () {
        throw "not yet implemented";
    };
    ShaderEntity.prototype.createRenderTarget = function (width, height) {
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
    ShaderEntity.prototype.loadShaders = function () {
        var _this = this;
        var urls = new Array();
        urls.push("entities/shaders/" + this.name + "/fragment.glsl");
        urls.push("entities/shaders/" + this.name + "/vertex.glsl");
        return Promise.all(urls.map(function (url) {
            return demolishedLoader_1.default(url).then(function (resp) { return resp.text(); });
        })).then(function (result) {
            _this.fragmentShader = _this.fragmentHeader + result[0];
            _this.vertexShader = _this.vertexHeader + result[1];
            return urls.length;
        }).catch(function (reason) {
            _this.onError(reason);
            return -1;
        });
    };
    ShaderEntity.prototype.compile = function (fs, vs) {
        if (vs) {
            this.vertexShader = vs;
        }
        this.fragmentShader = fs;
        this.initShader();
    };
    ShaderEntity.prototype.onSuccess = function (shader) {
    };
    ShaderEntity.prototype.onError = function (err) {
    };
    ShaderEntity.prototype.createTextureFromImage = function (width, height, image) {
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
    ShaderEntity.prototype.initShader = function () {
        var _this = this;
        var gl = this.gl;
        this.mainBuffer = gl.createBuffer();
        this.glProgram = gl.createProgram();
        var vs = this.createShader(gl, this.vertexShader, gl.VERTEX_SHADER);
        var fs = this.createShader(gl, this.fragmentShader, gl.FRAGMENT_SHADER);
        gl.attachShader(this.glProgram, vs);
        gl.attachShader(this.glProgram, fs);
        gl.linkProgram(this.glProgram);
        this.cacheUniformLocation('fft');
        this.cacheUniformLocation("subEffectId");
        this.cacheUniformLocation("playbacktime");
        this.cacheUniformLocation('time');
        this.cacheUniformLocation("datetime");
        this.cacheUniformLocation('frameId');
        this.cacheUniformLocation("timetotal");
        this.cacheUniformLocation('mouse');
        this.cacheUniformLocation('resolution');
        this.cacheUniformLocation("backbuffer");
        this.subEffectId = 0;
        this.frameId = 0;
        this.positionAttribute = 0;
        gl.enableVertexAttribArray(this.positionAttribute);
        this.vertexPosition = gl.getAttribLocation(this.glProgram, "pos");
        gl.enableVertexAttribArray(this.vertexPosition);
        this.textures.forEach(function (asset) {
            asset.texture = _this.createTextureFromImage(asset.width, asset.height, asset.image);
        });
        gl.useProgram(this.glProgram);
    };
    ShaderEntity.prototype.swapBuffers = function () {
        var tmp = this.target;
        this.target = this.backTarget;
        this.backTarget = tmp;
    };
    ShaderEntity.prototype.createShader = function (gl, src, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            this.onError(gl.getShaderInfoLog(shader));
        }
        else {
            this.onSuccess(shader);
        }
        return shader;
    };
    return ShaderEntity;
}(EntityBase));
exports.ShaderEntity = ShaderEntity;


/***/ }),

/***/ 5:
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
var demolishedLoader_1 = __webpack_require__(2);
var DemolishedSoundPeaks = (function () {
    function DemolishedSoundPeaks() {
    }
    DemolishedSoundPeaks.peaks = function (buffer, size) {
        var sampleSize = buffer.length / size;
        var sampleStep = ~~(sampleSize / 10) || 1;
        var channels = buffer.numberOfChannels;
        var peaks;
        for (var c = 0; c < channels; c++) {
            var chan = buffer.getChannelData(c);
            for (var i = 0; i < size; i++) {
                var start = ~~(i * sampleSize);
                var end = ~~(start + sampleSize);
                var min = 0;
                var max = 0;
                for (var j = start; j < end; j += sampleStep) {
                    var value = chan[j];
                    if (value > max) {
                        max = value;
                    }
                    if (value < min) {
                        min = value;
                    }
                }
                if (c == 0 || max > peaks[2 * i]) {
                    peaks[2 * i] = max;
                }
                if (c == 0 || min < peaks[2 * i + 1]) {
                    peaks[2 * i + 1] = min;
                }
            }
        }
        return peaks;
    };
    return DemolishedSoundPeaks;
}());
exports.DemolishedSoundPeaks = DemolishedSoundPeaks;
var DemolishedSoundBase = (function () {
    function DemolishedSoundBase() {
    }
    return DemolishedSoundBase;
}());
exports.DemolishedSoundBase = DemolishedSoundBase;
var DemolishedSIDMusic = (function (_super) {
    __extends(DemolishedSIDMusic, _super);
    function DemolishedSIDMusic() {
        return _super.call(this) || this;
    }
    DemolishedSIDMusic.prototype.getTracks = function () {
        throw "not yet implemented";
    };
    Object.defineProperty(DemolishedSIDMusic.prototype, "textureSize", {
        get: function () {
            return 16;
        },
        enumerable: true,
        configurable: true
    });
    DemolishedSIDMusic.prototype.play = function () {
        this.sid.play();
    };
    DemolishedSIDMusic.prototype.stop = function () {
        this.sid.pause();
    };
    DemolishedSIDMusic.prototype.mute = function (ismuted) {
        throw "not implemented";
    };
    DemolishedSIDMusic.prototype.getFrequenceData = function () {
        return this.sid.getFreqByteData();
    };
    Object.defineProperty(DemolishedSIDMusic.prototype, "duration", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DemolishedSIDMusic.prototype, "currentTime", {
        get: function () {
            return this.sid._currentPlaytime;
        },
        set: function (n) {
            return;
        },
        enumerable: true,
        configurable: true
    });
    DemolishedSIDMusic.prototype.createAudio = function (settings) {
        var useLess = function () { };
        var ScriptNodePlayer = window["ScriptNodePlayer"];
        var self = this;
        return new Promise(function (resolve, reject) {
            ScriptNodePlayer.createInstance(new SIDBackendAdapter(), "", [], true, useLess, function () {
                self.sid = this;
                resolve(true);
            }, useLess, useLess);
            ScriptNodePlayer.getInstance().loadMusicFromURL(settings.audioFile, {
                basePath: ""
            }, useLess, useLess);
        });
    };
    return DemolishedSIDMusic;
}(DemolishedSoundBase));
exports.DemolishedSIDMusic = DemolishedSIDMusic;
var DemolishedStreamingMusic = (function (_super) {
    __extends(DemolishedStreamingMusic, _super);
    function DemolishedStreamingMusic() {
        return _super.call(this) || this;
    }
    DemolishedStreamingMusic.prototype.getTracks = function () {
        var ms = this.audio.captureStream();
        return ms.getAudioTracks();
    };
    Object.defineProperty(DemolishedStreamingMusic.prototype, "textureSize", {
        get: function () {
            return 32;
        },
        enumerable: true,
        configurable: true
    });
    DemolishedStreamingMusic.prototype.getFrequenceData = function () {
        var bufferLength = this.audioAnalyser.frequencyBinCount;
        var freqArray = new Uint8Array(bufferLength);
        this.audioAnalyser.getByteFrequencyData(freqArray);
        return freqArray;
    };
    DemolishedStreamingMusic.prototype.play = function () {
        this.audio.play();
    };
    DemolishedStreamingMusic.prototype.stop = function () {
        this.audio.pause();
    };
    DemolishedStreamingMusic.prototype.mute = function (ismuted) {
        this.audio.muted = ismuted;
    };
    Object.defineProperty(DemolishedStreamingMusic.prototype, "duration", {
        get: function () {
            return this.audio.duration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DemolishedStreamingMusic.prototype, "currentTime", {
        get: function () {
            return this.audio.currentTime;
        },
        set: function (time) {
            this.audio.currentTime = time;
        },
        enumerable: true,
        configurable: true
    });
    DemolishedStreamingMusic.prototype.createAudio = function (audioSettings) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            demolishedLoader_1.default(audioSettings.audioFile).then(function (resp) {
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
                            audioEl.src = audioSettings.audioFile;
                            audioEl.crossOrigin = "anonymous";
                            var onLoad = function () {
                                var source = audioCtx.createMediaElementSource(audioEl);
                                var analyser = audioCtx.createAnalyser();
                                analyser.smoothingTimeConstant = audioSettings.audioAnalyzerSettings.smoothingTimeConstant;
                                analyser.fftSize = audioSettings.audioAnalyzerSettings.fftSize;
                                _this.audio = audioEl;
                                source.connect(analyser);
                                analyser.connect(audioCtx.destination);
                                _this.audioAnalyser = analyser;
                                resolve(true);
                            };
                            onLoad();
                            var bufferSource = audioCtx.createBufferSource();
                            bufferSource.buffer = renderedBuffer;
                        });
                    });
                });
            });
        });
    };
    return DemolishedStreamingMusic;
}(DemolishedSoundBase));
exports.DemolishedStreamingMusic = DemolishedStreamingMusic;


/***/ }),

/***/ 6:
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),

/***/ 7:
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, global) {/*! *****************************************************************************
Copyright (C) Microsoft. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
var Reflect;
(function (Reflect) {
    // Metadata Proposal
    // https://rbuckton.github.io/reflect-metadata/
    (function (factory) {
        var root = typeof global === "object" ? global :
            typeof self === "object" ? self :
                typeof this === "object" ? this :
                    Function("return this;")();
        var exporter = makeExporter(Reflect);
        if (typeof root.Reflect === "undefined") {
            root.Reflect = Reflect;
        }
        else {
            exporter = makeExporter(root.Reflect, exporter);
        }
        factory(exporter);
        function makeExporter(target, previous) {
            return function (key, value) {
                if (typeof target[key] !== "function") {
                    Object.defineProperty(target, key, { configurable: true, writable: true, value: value });
                }
                if (previous)
                    previous(key, value);
            };
        }
    })(function (exporter) {
        var hasOwn = Object.prototype.hasOwnProperty;
        // feature test for Symbol support
        var supportsSymbol = typeof Symbol === "function";
        var toPrimitiveSymbol = supportsSymbol && typeof Symbol.toPrimitive !== "undefined" ? Symbol.toPrimitive : "@@toPrimitive";
        var iteratorSymbol = supportsSymbol && typeof Symbol.iterator !== "undefined" ? Symbol.iterator : "@@iterator";
        var supportsCreate = typeof Object.create === "function"; // feature test for Object.create support
        var supportsProto = { __proto__: [] } instanceof Array; // feature test for __proto__ support
        var downLevel = !supportsCreate && !supportsProto;
        var HashMap = {
            // create an object in dictionary mode (a.k.a. "slow" mode in v8)
            create: supportsCreate
                ? function () { return MakeDictionary(Object.create(null)); }
                : supportsProto
                    ? function () { return MakeDictionary({ __proto__: null }); }
                    : function () { return MakeDictionary({}); },
            has: downLevel
                ? function (map, key) { return hasOwn.call(map, key); }
                : function (map, key) { return key in map; },
            get: downLevel
                ? function (map, key) { return hasOwn.call(map, key) ? map[key] : undefined; }
                : function (map, key) { return map[key]; },
        };
        // Load global or shim versions of Map, Set, and WeakMap
        var functionPrototype = Object.getPrototypeOf(Function);
        var usePolyfill = typeof process === "object" && process.env && process.env["REFLECT_METADATA_USE_MAP_POLYFILL"] === "true";
        var _Map = !usePolyfill && typeof Map === "function" && typeof Map.prototype.entries === "function" ? Map : CreateMapPolyfill();
        var _Set = !usePolyfill && typeof Set === "function" && typeof Set.prototype.entries === "function" ? Set : CreateSetPolyfill();
        var _WeakMap = !usePolyfill && typeof WeakMap === "function" ? WeakMap : CreateWeakMapPolyfill();
        // [[Metadata]] internal slot
        // https://rbuckton.github.io/reflect-metadata/#ordinary-object-internal-methods-and-internal-slots
        var Metadata = new _WeakMap();
        /**
         * Applies a set of decorators to a property of a target object.
         * @param decorators An array of decorators.
         * @param target The target object.
         * @param propertyKey (Optional) The property key to decorate.
         * @param attributes (Optional) The property descriptor for the target key.
         * @remarks Decorators are applied in reverse order.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Example = Reflect.decorate(decoratorsArray, Example);
         *
         *     // property (on constructor)
         *     Reflect.decorate(decoratorsArray, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.decorate(decoratorsArray, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Object.defineProperty(Example, "staticMethod",
         *         Reflect.decorate(decoratorsArray, Example, "staticMethod",
         *             Object.getOwnPropertyDescriptor(Example, "staticMethod")));
         *
         *     // method (on prototype)
         *     Object.defineProperty(Example.prototype, "method",
         *         Reflect.decorate(decoratorsArray, Example.prototype, "method",
         *             Object.getOwnPropertyDescriptor(Example.prototype, "method")));
         *
         */
        function decorate(decorators, target, propertyKey, attributes) {
            if (!IsUndefined(propertyKey)) {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsObject(attributes) && !IsUndefined(attributes) && !IsNull(attributes))
                    throw new TypeError();
                if (IsNull(attributes))
                    attributes = undefined;
                propertyKey = ToPropertyKey(propertyKey);
                return DecorateProperty(decorators, target, propertyKey, attributes);
            }
            else {
                if (!IsArray(decorators))
                    throw new TypeError();
                if (!IsConstructor(target))
                    throw new TypeError();
                return DecorateConstructor(decorators, target);
            }
        }
        exporter("decorate", decorate);
        // 4.1.2 Reflect.metadata(metadataKey, metadataValue)
        // https://rbuckton.github.io/reflect-metadata/#reflect.metadata
        /**
         * A default metadata decorator factory that can be used on a class, class member, or parameter.
         * @param metadataKey The key for the metadata entry.
         * @param metadataValue The value for the metadata entry.
         * @returns A decorator function.
         * @remarks
         * If `metadataKey` is already defined for the target and target key, the
         * metadataValue for that key will be overwritten.
         * @example
         *
         *     // constructor
         *     @Reflect.metadata(key, value)
         *     class Example {
         *     }
         *
         *     // property (on constructor, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticProperty;
         *     }
         *
         *     // property (on prototype, TypeScript only)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         property;
         *     }
         *
         *     // method (on constructor)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         static staticMethod() { }
         *     }
         *
         *     // method (on prototype)
         *     class Example {
         *         @Reflect.metadata(key, value)
         *         method() { }
         *     }
         *
         */
        function metadata(metadataKey, metadataValue) {
            function decorator(target, propertyKey) {
                if (!IsObject(target))
                    throw new TypeError();
                if (!IsUndefined(propertyKey) && !IsPropertyKey(propertyKey))
                    throw new TypeError();
                OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
            }
            return decorator;
        }
        exporter("metadata", metadata);
        /**
         * Define a unique metadata entry on the target.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param metadataValue A value that contains attached metadata.
         * @param target The target object on which to define metadata.
         * @param propertyKey (Optional) The property key for the target.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     Reflect.defineMetadata("custom:annotation", options, Example);
         *
         *     // property (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticProperty");
         *
         *     // property (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "property");
         *
         *     // method (on constructor)
         *     Reflect.defineMetadata("custom:annotation", options, Example, "staticMethod");
         *
         *     // method (on prototype)
         *     Reflect.defineMetadata("custom:annotation", options, Example.prototype, "method");
         *
         *     // decorator factory as metadata-producing annotation.
         *     function MyAnnotation(options): Decorator {
         *         return (target, key?) => Reflect.defineMetadata("custom:annotation", options, target, key);
         *     }
         *
         */
        function defineMetadata(metadataKey, metadataValue, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryDefineOwnMetadata(metadataKey, metadataValue, target, propertyKey);
        }
        exporter("defineMetadata", defineMetadata);
        /**
         * Gets a value indicating whether the target object or its prototype chain has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object or its prototype chain; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasMetadata", hasMetadata);
        /**
         * Gets a value indicating whether the target object has the provided metadata key defined.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata key was defined on the target object; otherwise, `false`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.hasOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function hasOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryHasOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("hasOwnMetadata", hasOwnMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object or its prototype chain.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetMetadata(metadataKey, target, propertyKey);
        }
        exporter("getMetadata", getMetadata);
        /**
         * Gets the metadata value for the provided metadata key on the target object.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns The metadata value for the metadata key if found; otherwise, `undefined`.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function getOwnMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryGetOwnMetadata(metadataKey, target, propertyKey);
        }
        exporter("getOwnMetadata", getOwnMetadata);
        /**
         * Gets the metadata keys defined on the target object or its prototype chain.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getMetadataKeys(Example.prototype, "method");
         *
         */
        function getMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryMetadataKeys(target, propertyKey);
        }
        exporter("getMetadataKeys", getMetadataKeys);
        /**
         * Gets the unique metadata keys defined on the target object.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns An array of unique metadata keys.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.getOwnMetadataKeys(Example);
         *
         *     // property (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.getOwnMetadataKeys(Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.getOwnMetadataKeys(Example.prototype, "method");
         *
         */
        function getOwnMetadataKeys(target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            return OrdinaryOwnMetadataKeys(target, propertyKey);
        }
        exporter("getOwnMetadataKeys", getOwnMetadataKeys);
        /**
         * Deletes the metadata entry from the target object with the provided key.
         * @param metadataKey A key used to store and retrieve metadata.
         * @param target The target object on which the metadata is defined.
         * @param propertyKey (Optional) The property key for the target.
         * @returns `true` if the metadata entry was found and deleted; otherwise, false.
         * @example
         *
         *     class Example {
         *         // property declarations are not part of ES6, though they are valid in TypeScript:
         *         // static staticProperty;
         *         // property;
         *
         *         constructor(p) { }
         *         static staticMethod(p) { }
         *         method(p) { }
         *     }
         *
         *     // constructor
         *     result = Reflect.deleteMetadata("custom:annotation", Example);
         *
         *     // property (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticProperty");
         *
         *     // property (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "property");
         *
         *     // method (on constructor)
         *     result = Reflect.deleteMetadata("custom:annotation", Example, "staticMethod");
         *
         *     // method (on prototype)
         *     result = Reflect.deleteMetadata("custom:annotation", Example.prototype, "method");
         *
         */
        function deleteMetadata(metadataKey, target, propertyKey) {
            if (!IsObject(target))
                throw new TypeError();
            if (!IsUndefined(propertyKey))
                propertyKey = ToPropertyKey(propertyKey);
            var metadataMap = GetOrCreateMetadataMap(target, propertyKey, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return false;
            if (!metadataMap.delete(metadataKey))
                return false;
            if (metadataMap.size > 0)
                return true;
            var targetMetadata = Metadata.get(target);
            targetMetadata.delete(propertyKey);
            if (targetMetadata.size > 0)
                return true;
            Metadata.delete(target);
            return true;
        }
        exporter("deleteMetadata", deleteMetadata);
        function DecorateConstructor(decorators, target) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsConstructor(decorated))
                        throw new TypeError();
                    target = decorated;
                }
            }
            return target;
        }
        function DecorateProperty(decorators, target, propertyKey, descriptor) {
            for (var i = decorators.length - 1; i >= 0; --i) {
                var decorator = decorators[i];
                var decorated = decorator(target, propertyKey, descriptor);
                if (!IsUndefined(decorated) && !IsNull(decorated)) {
                    if (!IsObject(decorated))
                        throw new TypeError();
                    descriptor = decorated;
                }
            }
            return descriptor;
        }
        function GetOrCreateMetadataMap(O, P, Create) {
            var targetMetadata = Metadata.get(O);
            if (IsUndefined(targetMetadata)) {
                if (!Create)
                    return undefined;
                targetMetadata = new _Map();
                Metadata.set(O, targetMetadata);
            }
            var metadataMap = targetMetadata.get(P);
            if (IsUndefined(metadataMap)) {
                if (!Create)
                    return undefined;
                metadataMap = new _Map();
                targetMetadata.set(P, metadataMap);
            }
            return metadataMap;
        }
        // 3.1.1.1 OrdinaryHasMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasmetadata
        function OrdinaryHasMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return true;
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryHasMetadata(MetadataKey, parent, P);
            return false;
        }
        // 3.1.2.1 OrdinaryHasOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryhasownmetadata
        function OrdinaryHasOwnMetadata(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return false;
            return ToBoolean(metadataMap.has(MetadataKey));
        }
        // 3.1.3.1 OrdinaryGetMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetmetadata
        function OrdinaryGetMetadata(MetadataKey, O, P) {
            var hasOwn = OrdinaryHasOwnMetadata(MetadataKey, O, P);
            if (hasOwn)
                return OrdinaryGetOwnMetadata(MetadataKey, O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (!IsNull(parent))
                return OrdinaryGetMetadata(MetadataKey, parent, P);
            return undefined;
        }
        // 3.1.4.1 OrdinaryGetOwnMetadata(MetadataKey, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarygetownmetadata
        function OrdinaryGetOwnMetadata(MetadataKey, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return undefined;
            return metadataMap.get(MetadataKey);
        }
        // 3.1.5.1 OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarydefineownmetadata
        function OrdinaryDefineOwnMetadata(MetadataKey, MetadataValue, O, P) {
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ true);
            metadataMap.set(MetadataKey, MetadataValue);
        }
        // 3.1.6.1 OrdinaryMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinarymetadatakeys
        function OrdinaryMetadataKeys(O, P) {
            var ownKeys = OrdinaryOwnMetadataKeys(O, P);
            var parent = OrdinaryGetPrototypeOf(O);
            if (parent === null)
                return ownKeys;
            var parentKeys = OrdinaryMetadataKeys(parent, P);
            if (parentKeys.length <= 0)
                return ownKeys;
            if (ownKeys.length <= 0)
                return parentKeys;
            var set = new _Set();
            var keys = [];
            for (var _i = 0, ownKeys_1 = ownKeys; _i < ownKeys_1.length; _i++) {
                var key = ownKeys_1[_i];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            for (var _a = 0, parentKeys_1 = parentKeys; _a < parentKeys_1.length; _a++) {
                var key = parentKeys_1[_a];
                var hasKey = set.has(key);
                if (!hasKey) {
                    set.add(key);
                    keys.push(key);
                }
            }
            return keys;
        }
        // 3.1.7.1 OrdinaryOwnMetadataKeys(O, P)
        // https://rbuckton.github.io/reflect-metadata/#ordinaryownmetadatakeys
        function OrdinaryOwnMetadataKeys(O, P) {
            var keys = [];
            var metadataMap = GetOrCreateMetadataMap(O, P, /*Create*/ false);
            if (IsUndefined(metadataMap))
                return keys;
            var keysObj = metadataMap.keys();
            var iterator = GetIterator(keysObj);
            var k = 0;
            while (true) {
                var next = IteratorStep(iterator);
                if (!next) {
                    keys.length = k;
                    return keys;
                }
                var nextValue = IteratorValue(next);
                try {
                    keys[k] = nextValue;
                }
                catch (e) {
                    try {
                        IteratorClose(iterator);
                    }
                    finally {
                        throw e;
                    }
                }
                k++;
            }
        }
        // 6 ECMAScript Data Typ0es and Values
        // https://tc39.github.io/ecma262/#sec-ecmascript-data-types-and-values
        function Type(x) {
            if (x === null)
                return 1 /* Null */;
            switch (typeof x) {
                case "undefined": return 0 /* Undefined */;
                case "boolean": return 2 /* Boolean */;
                case "string": return 3 /* String */;
                case "symbol": return 4 /* Symbol */;
                case "number": return 5 /* Number */;
                case "object": return x === null ? 1 /* Null */ : 6 /* Object */;
                default: return 6 /* Object */;
            }
        }
        // 6.1.1 The Undefined Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-undefined-type
        function IsUndefined(x) {
            return x === undefined;
        }
        // 6.1.2 The Null Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-null-type
        function IsNull(x) {
            return x === null;
        }
        // 6.1.5 The Symbol Type
        // https://tc39.github.io/ecma262/#sec-ecmascript-language-types-symbol-type
        function IsSymbol(x) {
            return typeof x === "symbol";
        }
        // 6.1.7 The Object Type
        // https://tc39.github.io/ecma262/#sec-object-type
        function IsObject(x) {
            return typeof x === "object" ? x !== null : typeof x === "function";
        }
        // 7.1 Type Conversion
        // https://tc39.github.io/ecma262/#sec-type-conversion
        // 7.1.1 ToPrimitive(input [, PreferredType])
        // https://tc39.github.io/ecma262/#sec-toprimitive
        function ToPrimitive(input, PreferredType) {
            switch (Type(input)) {
                case 0 /* Undefined */: return input;
                case 1 /* Null */: return input;
                case 2 /* Boolean */: return input;
                case 3 /* String */: return input;
                case 4 /* Symbol */: return input;
                case 5 /* Number */: return input;
            }
            var hint = PreferredType === 3 /* String */ ? "string" : PreferredType === 5 /* Number */ ? "number" : "default";
            var exoticToPrim = GetMethod(input, toPrimitiveSymbol);
            if (exoticToPrim !== undefined) {
                var result = exoticToPrim.call(input, hint);
                if (IsObject(result))
                    throw new TypeError();
                return result;
            }
            return OrdinaryToPrimitive(input, hint === "default" ? "number" : hint);
        }
        // 7.1.1.1 OrdinaryToPrimitive(O, hint)
        // https://tc39.github.io/ecma262/#sec-ordinarytoprimitive
        function OrdinaryToPrimitive(O, hint) {
            if (hint === "string") {
                var toString_1 = O.toString;
                if (IsCallable(toString_1)) {
                    var result = toString_1.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            else {
                var valueOf = O.valueOf;
                if (IsCallable(valueOf)) {
                    var result = valueOf.call(O);
                    if (!IsObject(result))
                        return result;
                }
                var toString_2 = O.toString;
                if (IsCallable(toString_2)) {
                    var result = toString_2.call(O);
                    if (!IsObject(result))
                        return result;
                }
            }
            throw new TypeError();
        }
        // 7.1.2 ToBoolean(argument)
        // https://tc39.github.io/ecma262/2016/#sec-toboolean
        function ToBoolean(argument) {
            return !!argument;
        }
        // 7.1.12 ToString(argument)
        // https://tc39.github.io/ecma262/#sec-tostring
        function ToString(argument) {
            return "" + argument;
        }
        // 7.1.14 ToPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-topropertykey
        function ToPropertyKey(argument) {
            var key = ToPrimitive(argument, 3 /* String */);
            if (IsSymbol(key))
                return key;
            return ToString(key);
        }
        // 7.2 Testing and Comparison Operations
        // https://tc39.github.io/ecma262/#sec-testing-and-comparison-operations
        // 7.2.2 IsArray(argument)
        // https://tc39.github.io/ecma262/#sec-isarray
        function IsArray(argument) {
            return Array.isArray
                ? Array.isArray(argument)
                : argument instanceof Object
                    ? argument instanceof Array
                    : Object.prototype.toString.call(argument) === "[object Array]";
        }
        // 7.2.3 IsCallable(argument)
        // https://tc39.github.io/ecma262/#sec-iscallable
        function IsCallable(argument) {
            // NOTE: This is an approximation as we cannot check for [[Call]] internal method.
            return typeof argument === "function";
        }
        // 7.2.4 IsConstructor(argument)
        // https://tc39.github.io/ecma262/#sec-isconstructor
        function IsConstructor(argument) {
            // NOTE: This is an approximation as we cannot check for [[Construct]] internal method.
            return typeof argument === "function";
        }
        // 7.2.7 IsPropertyKey(argument)
        // https://tc39.github.io/ecma262/#sec-ispropertykey
        function IsPropertyKey(argument) {
            switch (Type(argument)) {
                case 3 /* String */: return true;
                case 4 /* Symbol */: return true;
                default: return false;
            }
        }
        // 7.3 Operations on Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-objects
        // 7.3.9 GetMethod(V, P)
        // https://tc39.github.io/ecma262/#sec-getmethod
        function GetMethod(V, P) {
            var func = V[P];
            if (func === undefined || func === null)
                return undefined;
            if (!IsCallable(func))
                throw new TypeError();
            return func;
        }
        // 7.4 Operations on Iterator Objects
        // https://tc39.github.io/ecma262/#sec-operations-on-iterator-objects
        function GetIterator(obj) {
            var method = GetMethod(obj, iteratorSymbol);
            if (!IsCallable(method))
                throw new TypeError(); // from Call
            var iterator = method.call(obj);
            if (!IsObject(iterator))
                throw new TypeError();
            return iterator;
        }
        // 7.4.4 IteratorValue(iterResult)
        // https://tc39.github.io/ecma262/2016/#sec-iteratorvalue
        function IteratorValue(iterResult) {
            return iterResult.value;
        }
        // 7.4.5 IteratorStep(iterator)
        // https://tc39.github.io/ecma262/#sec-iteratorstep
        function IteratorStep(iterator) {
            var result = iterator.next();
            return result.done ? false : result;
        }
        // 7.4.6 IteratorClose(iterator, completion)
        // https://tc39.github.io/ecma262/#sec-iteratorclose
        function IteratorClose(iterator) {
            var f = iterator["return"];
            if (f)
                f.call(iterator);
        }
        // 9.1 Ordinary Object Internal Methods and Internal Slots
        // https://tc39.github.io/ecma262/#sec-ordinary-object-internal-methods-and-internal-slots
        // 9.1.1.1 OrdinaryGetPrototypeOf(O)
        // https://tc39.github.io/ecma262/#sec-ordinarygetprototypeof
        function OrdinaryGetPrototypeOf(O) {
            var proto = Object.getPrototypeOf(O);
            if (typeof O !== "function" || O === functionPrototype)
                return proto;
            // TypeScript doesn't set __proto__ in ES5, as it's non-standard.
            // Try to determine the superclass constructor. Compatible implementations
            // must either set __proto__ on a subclass constructor to the superclass constructor,
            // or ensure each class has a valid `constructor` property on its prototype that
            // points back to the constructor.
            // If this is not the same as Function.[[Prototype]], then this is definately inherited.
            // This is the case when in ES6 or when using __proto__ in a compatible browser.
            if (proto !== functionPrototype)
                return proto;
            // If the super prototype is Object.prototype, null, or undefined, then we cannot determine the heritage.
            var prototype = O.prototype;
            var prototypeProto = prototype && Object.getPrototypeOf(prototype);
            if (prototypeProto == null || prototypeProto === Object.prototype)
                return proto;
            // If the constructor was not a function, then we cannot determine the heritage.
            var constructor = prototypeProto.constructor;
            if (typeof constructor !== "function")
                return proto;
            // If we have some kind of self-reference, then we cannot determine the heritage.
            if (constructor === O)
                return proto;
            // we have a pretty good guess at the heritage.
            return constructor;
        }
        // naive Map shim
        function CreateMapPolyfill() {
            var cacheSentinel = {};
            var arraySentinel = [];
            var MapIterator = (function () {
                function MapIterator(keys, values, selector) {
                    this._index = 0;
                    this._keys = keys;
                    this._values = values;
                    this._selector = selector;
                }
                MapIterator.prototype["@@iterator"] = function () { return this; };
                MapIterator.prototype[iteratorSymbol] = function () { return this; };
                MapIterator.prototype.next = function () {
                    var index = this._index;
                    if (index >= 0 && index < this._keys.length) {
                        var result = this._selector(this._keys[index], this._values[index]);
                        if (index + 1 >= this._keys.length) {
                            this._index = -1;
                            this._keys = arraySentinel;
                            this._values = arraySentinel;
                        }
                        else {
                            this._index++;
                        }
                        return { value: result, done: false };
                    }
                    return { value: undefined, done: true };
                };
                MapIterator.prototype.throw = function (error) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    throw error;
                };
                MapIterator.prototype.return = function (value) {
                    if (this._index >= 0) {
                        this._index = -1;
                        this._keys = arraySentinel;
                        this._values = arraySentinel;
                    }
                    return { value: value, done: true };
                };
                return MapIterator;
            }());
            return (function () {
                function Map() {
                    this._keys = [];
                    this._values = [];
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                }
                Object.defineProperty(Map.prototype, "size", {
                    get: function () { return this._keys.length; },
                    enumerable: true,
                    configurable: true
                });
                Map.prototype.has = function (key) { return this._find(key, /*insert*/ false) >= 0; };
                Map.prototype.get = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    return index >= 0 ? this._values[index] : undefined;
                };
                Map.prototype.set = function (key, value) {
                    var index = this._find(key, /*insert*/ true);
                    this._values[index] = value;
                    return this;
                };
                Map.prototype.delete = function (key) {
                    var index = this._find(key, /*insert*/ false);
                    if (index >= 0) {
                        var size = this._keys.length;
                        for (var i = index + 1; i < size; i++) {
                            this._keys[i - 1] = this._keys[i];
                            this._values[i - 1] = this._values[i];
                        }
                        this._keys.length--;
                        this._values.length--;
                        if (key === this._cacheKey) {
                            this._cacheKey = cacheSentinel;
                            this._cacheIndex = -2;
                        }
                        return true;
                    }
                    return false;
                };
                Map.prototype.clear = function () {
                    this._keys.length = 0;
                    this._values.length = 0;
                    this._cacheKey = cacheSentinel;
                    this._cacheIndex = -2;
                };
                Map.prototype.keys = function () { return new MapIterator(this._keys, this._values, getKey); };
                Map.prototype.values = function () { return new MapIterator(this._keys, this._values, getValue); };
                Map.prototype.entries = function () { return new MapIterator(this._keys, this._values, getEntry); };
                Map.prototype["@@iterator"] = function () { return this.entries(); };
                Map.prototype[iteratorSymbol] = function () { return this.entries(); };
                Map.prototype._find = function (key, insert) {
                    if (this._cacheKey !== key) {
                        this._cacheIndex = this._keys.indexOf(this._cacheKey = key);
                    }
                    if (this._cacheIndex < 0 && insert) {
                        this._cacheIndex = this._keys.length;
                        this._keys.push(key);
                        this._values.push(undefined);
                    }
                    return this._cacheIndex;
                };
                return Map;
            }());
            function getKey(key, _) {
                return key;
            }
            function getValue(_, value) {
                return value;
            }
            function getEntry(key, value) {
                return [key, value];
            }
        }
        // naive Set shim
        function CreateSetPolyfill() {
            return (function () {
                function Set() {
                    this._map = new _Map();
                }
                Object.defineProperty(Set.prototype, "size", {
                    get: function () { return this._map.size; },
                    enumerable: true,
                    configurable: true
                });
                Set.prototype.has = function (value) { return this._map.has(value); };
                Set.prototype.add = function (value) { return this._map.set(value, value), this; };
                Set.prototype.delete = function (value) { return this._map.delete(value); };
                Set.prototype.clear = function () { this._map.clear(); };
                Set.prototype.keys = function () { return this._map.keys(); };
                Set.prototype.values = function () { return this._map.values(); };
                Set.prototype.entries = function () { return this._map.entries(); };
                Set.prototype["@@iterator"] = function () { return this.keys(); };
                Set.prototype[iteratorSymbol] = function () { return this.keys(); };
                return Set;
            }());
        }
        // naive WeakMap shim
        function CreateWeakMapPolyfill() {
            var UUID_SIZE = 16;
            var keys = HashMap.create();
            var rootKey = CreateUniqueKey();
            return (function () {
                function WeakMap() {
                    this._key = CreateUniqueKey();
                }
                WeakMap.prototype.has = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.has(table, this._key) : false;
                };
                WeakMap.prototype.get = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? HashMap.get(table, this._key) : undefined;
                };
                WeakMap.prototype.set = function (target, value) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ true);
                    table[this._key] = value;
                    return this;
                };
                WeakMap.prototype.delete = function (target) {
                    var table = GetOrCreateWeakMapTable(target, /*create*/ false);
                    return table !== undefined ? delete table[this._key] : false;
                };
                WeakMap.prototype.clear = function () {
                    // NOTE: not a real clear, just makes the previous data unreachable
                    this._key = CreateUniqueKey();
                };
                return WeakMap;
            }());
            function CreateUniqueKey() {
                var key;
                do
                    key = "@@WeakMap@@" + CreateUUID();
                while (HashMap.has(keys, key));
                keys[key] = true;
                return key;
            }
            function GetOrCreateWeakMapTable(target, create) {
                if (!hasOwn.call(target, rootKey)) {
                    if (!create)
                        return undefined;
                    Object.defineProperty(target, rootKey, { value: HashMap.create() });
                }
                return target[rootKey];
            }
            function FillRandomBytes(buffer, size) {
                for (var i = 0; i < size; ++i)
                    buffer[i] = Math.random() * 0xff | 0;
                return buffer;
            }
            function GenRandomBytes(size) {
                if (typeof Uint8Array === "function") {
                    if (typeof crypto !== "undefined")
                        return crypto.getRandomValues(new Uint8Array(size));
                    if (typeof msCrypto !== "undefined")
                        return msCrypto.getRandomValues(new Uint8Array(size));
                    return FillRandomBytes(new Uint8Array(size), size);
                }
                return FillRandomBytes(new Array(size), size);
            }
            function CreateUUID() {
                var data = GenRandomBytes(UUID_SIZE);
                // mark as random - RFC 4122 § 4.4
                data[6] = data[6] & 0x4f | 0x40;
                data[8] = data[8] & 0xbf | 0x80;
                var result = "";
                for (var offset = 0; offset < UUID_SIZE; ++offset) {
                    var byte = data[offset];
                    if (offset === 4 || offset === 6 || offset === 8)
                        result += "-";
                    if (byte < 16)
                        result += "0";
                    result += byte.toString(16).toLowerCase();
                }
                return result;
            }
        }
        // uses a heuristic used by v8 and chakra to force an object into dictionary mode.
        function MakeDictionary(obj) {
            obj.__ = undefined;
            delete obj.__;
            return obj;
        }
    });
})(Reflect || (Reflect = {}));
//# sourceMappingURL=Reflect.js.map
/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(6), __webpack_require__(8)))

/***/ }),

/***/ 8:
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || Function("return this")() || (1,eval)("this");
} catch(e) {
	// This works if the window reference is available
	if(typeof window === "object")
		g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),

/***/ 9:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(7);
var DemolishedPropertyHandler = (function () {
    function DemolishedPropertyHandler() {
    }
    DemolishedPropertyHandler.prototype.set = function (target, key, value, receiver) {
        var old = Reflect.get(target, key, receiver);
        return Reflect.set(target, key, value, receiver);
    };
    DemolishedPropertyHandler.prototype.get = function (target, key, receiver) {
        return Reflect.get(target, key, receiver);
    };
    DemolishedPropertyHandler.prototype.observe = function () {
    };
    return DemolishedPropertyHandler;
}());
exports.DemolishedPropertyHandler = DemolishedPropertyHandler;
function Observe(isObserved) {
    return function (target, key) {
        return Reflect.defineMetadata("isObserved", isObserved, target, key);
    };
}
exports.Observe = Observe;
var DemoishedProperty = (function () {
    function DemoishedProperty(target) {
        this.target = target;
        this.handler = new DemolishedPropertyHandler();
    }
    DemoishedProperty.prototype.getObserver = function () {
        return new Proxy(this.target, this.handler);
    };
    return DemoishedProperty;
}());
exports.DemoishedProperty = DemoishedProperty;
var DemolishedDialogBuilder = (function () {
    function DemolishedDialogBuilder() {
    }
    DemolishedDialogBuilder.render = function (observer, parent) {
        var _this = this;
        var keys = Object.keys(observer);
        keys.forEach(function (key) {
            var prop = observer[key];
            var isObserved = Reflect.getMetadata("isObserved", observer, key);
            if (isObserved) {
                if (typeof (prop) == "number" || typeof (prop) == "string") {
                    var field = document.createElement("div");
                    var label = document.createElement("label");
                    label.textContent = key;
                    field.appendChild(label);
                    var input = document.createElement("input");
                    input.type = "text";
                    input.id = key;
                    input.value = prop.toString();
                    input.addEventListener("change", function (evt) {
                        observer[key] = evt.target["value"];
                    });
                    input.addEventListener("click", function (evt) {
                        evt.target["value"] = observer[key];
                    });
                    field.appendChild(input);
                    parent.appendChild(field);
                }
                else if (typeof (prop) == "object") {
                    _this.render(observer[key], parent);
                }
            }
        });
    };
    return DemolishedDialogBuilder;
}());
exports.DemolishedDialogBuilder = DemolishedDialogBuilder;


/***/ })

/******/ });