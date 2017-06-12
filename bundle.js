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

if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
        return function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
    })();
}
var Demolished;
(function (Demolished) {
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
        return Utils;
    }());
    Demolished.Utils = Utils;
    var Parameters = (function () {
        function Parameters(screenWidth, screenHeight) {
            this.screenWidth = screenWidth;
            this.screenHeight = screenHeight;
        }
        Parameters.prototype.setScreen = function (w, h) {
            this.screenWidth = w;
            this.screenWidth = h;
        };
        return Parameters;
    }());
    Demolished.Parameters = Parameters;
    var Effect = (function () {
        function Effect() {
            this.textures = new Array();
        }
        return Effect;
    }());
    Demolished.Effect = Effect;
    var EnityBase = (function () {
        function EnityBase(gl, name, start, stop, x, y, assets) {
            var _this = this;
            this.gl = gl;
            this.name = name;
            this.start = start;
            this.stop = stop;
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
            var target = new RenderTarget(gl.createFramebuffer(), gl.createRenderbuffer(), gl.createTexture());
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
            this.cacheUniformLocation('freq_data');
            this.cacheUniformLocation('freq_time');
            this.cacheUniformLocation("mytext");
            this.cacheUniformLocation('time');
            this.cacheUniformLocation('mouse');
            this.cacheUniformLocation('resolution');
            this.cacheUniformLocation("sampleRate");
            this.cacheUniformLocation("fft");
            // this.positionAttribute = 0;// gl.getAttribLocation(this.currentProgram, "surfacePosAttrib");
            // gl.enableVertexAttribArray(this.positionAttribute);
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
    Demolished.EnityBase = EnityBase;
    var RenderTarget = (function () {
        function RenderTarget(frameBuffer, renderBuffer, texture) {
            this.frameBuffer = frameBuffer;
            this.renderBuffer = renderBuffer;
            this.texture = texture;
        }
        return RenderTarget;
    }());
    Demolished.RenderTarget = RenderTarget;
    var Asset = (function () {
        function Asset(image, name, width, height, assetType) {
            this.image = image;
            this.name = name;
            this.width = width;
            this.height = height;
            this.assetType = assetType;
        }
        return Asset;
    }());
    Demolished.Asset = Asset;
    var AudioAnalyzerSettings = (function () {
        function AudioAnalyzerSettings(fftSize, smoothingTimeConstant, minDecibels, maxDecibels) {
            this.fftSize = fftSize;
            this.smoothingTimeConstant = smoothingTimeConstant;
            this.minDecibels = minDecibels;
            this.maxDecibels = maxDecibels;
        }
        return AudioAnalyzerSettings;
    }());
    Demolished.AudioAnalyzerSettings = AudioAnalyzerSettings;
    var World = (function () {
        function World(canvas, timelineFile, audioAnalyzerSettings) {
            var _this = this;
            this.canvas = canvas;
            this.timelineFile = timelineFile;
            this.audioAnalyzerSettings = audioAnalyzerSettings;
            this.width = 1;
            this.height = 1;
            this.centerX = 0;
            this.centerY = 0;
            this.currentEntity = -1;
            this.parameters = new Parameters(this.canvas.width, this.canvas.height);
            this.parameters.time = 0;
            this.parameters.mouseX = 0.5;
            this.parameters.mouseY = 0.5;
            this.entities = new Array();
            this.gl = this.getRendringContext();
            this.fftTexture = this.gl.createTexture();
            this.webGLbuffer = this.gl.createBuffer();
            this.addEventListeners();
            // load and add the entities
            this.loadTimeline(this.timelineFile).then(function (timeline) {
                console.log("timeline fetched");
                timeline.entities.sort(function (a, b) {
                    return a.start - b.start;
                });
                _this.cretateAudio("assets/song.mp3").then(function (analyzer) {
                    console.log("audio fetched & created");
                    _this.audioAnalyser = analyzer;
                    _this.audioAnalyser.smoothingTimeConstant = _this.audioAnalyzerSettings.smoothingTimeConstant;
                    _this.audioAnalyser.fftSize = _this.audioAnalyzerSettings.fftSize;
                    _this.audioAnalyser.maxDecibels = -10;
                    _this.audioAnalyser.minDecibels = -90;
                    timeline.entities.forEach(function (effect) {
                        var textures = Promise.all(effect.textures.map(function (texture) {
                            return new Promise(function (resolve, reject) {
                                var image = new Image();
                                image.src = texture.url;
                                image.onload = function () {
                                    resolve(image);
                                };
                                image.onerror = function (err) { return resolve(err); };
                            }).then(function (image) {
                                return new Asset(image, texture.uniform, texture.width, texture.height, 0);
                            });
                        })).then(function (assets) {
                            _this.addEntity(effect.name, effect.start, effect.stop, assets);
                            if (_this.entities.length === timeline.entities.length) {
                                _this.onReady();
                                _this.resizeCanvas();
                            }
                        });
                    });
                    _this.resizeCanvas();
                });
            });
        }
        World.prototype.getRendringContext = function () {
            var renderingContext;
            var contextAttributes = {
                preserveDrawingBuffer: true
            };
            renderingContext =
                this.canvas.getContext('webgl2', contextAttributes) ||
                    this.canvas.getContext('webgl', contextAttributes) ||
                    this.canvas.getContext('experimental-webgl', contextAttributes);
            /*
   mFloat32Textures  = mGL.getExtension( 'OES_texture_float' );
                            mFloat32Filter    = mGL.getExtension( 'OES_texture_float_linear');
                            mFloat16Textures  = mGL.getExtension( 'OES_texture_half_float' );
                            mFloat16Filter    = mGL.getExtension( 'OES_texture_half_float_linear' );
                            mDerivatives      = mGL.getExtension( 'OES_standard_derivatives' );
                            mDrawBuffers      = mGL.getExtension( 'WEBGL_draw_buffers' );
                            mDepthTextures    = mGL.getExtension( 'WEBGL_depth_texture' );
                            mShaderTextureLOD = mGL.getExtension( 'EXT_shader_texture_lod' );
                            mAnisotropic      = mGL.getExtension( 'EXT_texture_filter_anisotropic' );

            */
            renderingContext.getExtension('OES_standard_derivatives');
            renderingContext.getExtension("OES_texture_float");
            renderingContext.getExtension("OES_texture_half_float");
            renderingContext.getExtension("OES_texture_half_float_linear");
            renderingContext.getExtension("WEBGL_draw_buffers");
            renderingContext.getExtension("WEBGL_depth_texture");
            renderingContext.getExtension("EXT_shader_texture_lod");
            renderingContext.getExtension("EXT_texture_filter_anisotropic");
            renderingContext.getExtension('EXT_shader_texture_lod');
            this.webGLbuffer = renderingContext.createBuffer();
            renderingContext.bindBuffer(renderingContext.ARRAY_BUFFER, this.webGLbuffer);
            renderingContext.bufferData(renderingContext.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), renderingContext.STATIC_DRAW);
            return renderingContext;
        };
        World.prototype.loadTimeline = function (timelineFile) {
            return fetch(timelineFile).then(function (response) {
                return response.json();
            }).then(function (timeline) {
                return timeline;
            });
        };
        World.prototype.onFrame = function (frame) { };
        World.prototype.onStart = function () { };
        World.prototype.onStop = function () { };
        World.prototype.onReady = function () { };
        // todo:Rename
        World.prototype.getAudioTracks = function () {
            var ms = this.audio["captureStream"](60);
            return ms.getAudioTracks();
        };
        World.prototype.cretateAudio = function (src) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var audioEl = new Audio(); //document.createElement("audio");
                audioEl.preload = "auto";
                audioEl.src = src;
                audioEl.crossOrigin = "anonymous";
                var context = new AudioContext();
                var analyser = context.createAnalyser();
                var onLoad = function () {
                    var source = context.createMediaElementSource(audioEl);
                    source.connect(analyser);
                    analyser.connect(context.destination);
                    resolve(analyser);
                    window.addEventListener("load", onLoad, false);
                };
                // Need window.onload to fire first. See crbug.com/112368.
                onLoad();
                _this.audio = audioEl;
            });
        };
        World.prototype.addEventListeners = function () {
            var _this = this;
            document.addEventListener("mousemove", function (evt) {
                _this.parameters.mouseX = evt.clientX / window.innerWidth;
                _this.parameters.mouseY = 1 - evt.clientY / window.innerHeight;
            });
            window.addEventListener("resize", function () {
                _this.resizeCanvas();
            });
        };
        World.prototype.addEntity = function (name, start, stop, textures) {
            var entity = new EnityBase(this.gl, name, start, stop, this.canvas.width, this.canvas.height, textures);
            this.entities.push(entity);
            return entity;
        };
        World.prototype.findEntityByTime = function (time) {
            return this.entities.findIndex(function (pre) {
                return time < pre.stop && time >= pre.start;
            });
        };
        World.prototype.start = function (time) {
            // ensure that entities are in correct order.
            this.entities.sort(function (a, b) {
                return a.start - b.start;
            });
            this.animationOffsetTime = time;
            this.currentEntity = this.findEntityByTime(time);
            this.animationStartTime = performance.now();
            this.animate(time);
            this.audio.currentTime = (time / 1000) % 60;
            this.audio.play();
            this.onStart();
        };
        World.prototype.stop = function () {
            cancelAnimationFrame(this.animationFrameId);
            ;
            this.onStop();
            return this.animationFrameId;
        };
        World.prototype.updateTextureData = function (texture, width, height, bytes) {
            var gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        };
        World.prototype.animate = function (time) {
            var _this = this;
            var at = time - this.animationStartTime;
            this.animationFrameId = requestAnimationFrame(function (_time) {
                _this.animate(_time);
            });
            if (this.audioAnalyser) {
                var bufferLength = this.audioAnalyser.frequencyBinCount;
                var freqArray = new Uint8Array(bufferLength);
                this.audioAnalyser.getByteFrequencyData(freqArray);
                this.updateTextureData(this.fftTexture, 32, 32, freqArray);
            }
            var ent = this.entities[this.currentEntity];
            if (at > ent.stop) {
                this.currentEntity++;
                if (this.currentEntity === this.entities.length) {
                    this.stop();
                }
            }
            this.renderEntities(ent, at);
        };
        World.prototype.surfaceCorners = function () {
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
        World.prototype.setViewPort = function (width, height) {
            this.gl.viewport(0, 0, width, height);
        };
        World.prototype.resizeCanvas = function () {
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
        };
        World.prototype.renderEntities = function (ent, ts) {
            var gl = this.gl;
            this.parameters.time = ts; // Date.now() - this.parameters.startTime;
            gl.useProgram(ent.currentProgram);
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
        return World;
    }());
    Demolished.World = World;
})(Demolished = exports.Demolished || (exports.Demolished = {}));


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var DemolishedRecorder = (function () {
    function DemolishedRecorder(videoTrack, audioTrack) {
        var _this = this;
        this.videoTrack = videoTrack;
        this.audioTrack = audioTrack;
        this.mediaStream = new MediaStream([videoTrack, audioTrack]);
        this.recorder = new MediaRecorder(this.mediaStream, {
            mimeType: 'video/webm;codecs=vp9' });
        this.recorder.ondataavailable = function (e) { return _this.data.push(e.data); };
    }
    DemolishedRecorder.prototype.stop = function () {
        this.recorder.stop();
    };
    DemolishedRecorder.prototype.start = function (n) {
        this.data = new Array();
        this.recorder.start(n);
    };
    return DemolishedRecorder;
}());
exports.DemolishedRecorder = DemolishedRecorder;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var demolished_1 = __webpack_require__(0);
var demolishedRecorder_1 = __webpack_require__(1);
var DemolishedSequencer = (function () {
    function DemolishedSequencer() {
        var _this = this;
        this.duration = 312600;
        this.timeLine = document.querySelector(".demolished-timeline input");
        this.timeLine.addEventListener("mousedown", function (evt) {
            _this.world.stop();
        });
        this.timeLine.addEventListener("mouseup", function (evt) {
            var ms = parseInt(evt.target.value);
            var s = (ms / 1000) % 60;
            _this.world.audio.currentTime = s;
            _this.world.audio.play();
            _this.world.start(ms);
        });
        this.timeLine.addEventListener("change", function (evt) {
        });
        var analyzerSettings = new demolished_1.Demolished.AudioAnalyzerSettings(8192, 0.85, -100, -30);
        var canvas = document.querySelector("#gl");
        window.onerror = function () {
            _this.world.stop();
        };
        this.world = new demolished_1.Demolished.World(canvas, "entities/timeline.json", analyzerSettings);
        this.world.onReady = function () {
            var arr = _this.world.entities.map(function (a, index) {
                return {
                    d: a.stop - a.start, i: index };
            });
            _this.getTimeLineDetails(arr);
            _this.timeLine.setAttribute("max", _this.duration.toString());
            _this.onReady();
        };
        this.world.onStart = function () {
            var p = document.querySelector("#record-canvas");
            if (p.checked) {
                var videoStream = _this.world.canvas["captureStream"](60);
                var videoTrack = videoStream.getVideoTracks()[0];
                var audioTrack = _this.world.getAudioTracks()[0];
                _this.recorder = new demolishedRecorder_1.DemolishedRecorder(videoTrack, audioTrack);
                _this.recorder.start(100);
            }
        };
        this.world.onFrame = function (frame) {
            var t = frame.ts;
            document.querySelector("#time").textContent =
                ((t / 1000) / 60).toFixed(0).toString() + ":" +
                    ((t / 1000) % 60).toFixed(2).toString();
            if (!_this.pauseUi)
                _this.timeLine.value = frame.ts.toString();
        };
        this.world.onStop = function () {
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
            var d = (parseInt(ent.d) / _this.duration);
            var w = 100 * (Math.round(100 * (d * 1)) / 100);
            el.style.width = w + "%";
            el.style.left = ox + "%";
            el.style.background = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
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
        demolished.world.start(location.hash == "" ? 0 : parseInt(location.hash.substring(1)));
    });
});


/***/ })
/******/ ]);