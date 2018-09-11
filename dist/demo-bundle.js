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
/******/ 	return __webpack_require__(__webpack_require__.s = 35);
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
    };
    TimeFragment.prototype.setEntity = function (ent) {
        this.entityShader = ent;
    };
    TimeFragment.prototype.init = function () {
        var _this = this;
        try {
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
        }
        catch (err) {
            console.warn(err);
        }
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

Object.defineProperty(exports, "__esModule", { value: true });
var demolishedEntity_1 = __webpack_require__(4);
var demolishedModels_1 = __webpack_require__(1);
var demolishedLoader_1 = __webpack_require__(2);
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
        return Rendering;
    }());
    Demolished.Rendering = Rendering;
})(Demolished = exports.Demolished || (exports.Demolished = {}));


/***/ }),

/***/ 30:
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

/***/ 35:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var demolished_1 = __webpack_require__(3);
var DemolishedSonant_1 = __webpack_require__(30);
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
            return Math.floor(this.audio.duration * 1000.);
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


/***/ })

/******/ });