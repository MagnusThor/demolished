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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
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
/*
        parameters: any =
        {
            startTime: Date.now(),
            time: 0,
            mouseX: 0.5,
            mouseY: 0.5,
            screenWidth: 500,
            screenHeight: 500,
            custom: {}
        };

*/
class Parameters {
    constructor() {
    }
}
exports.Parameters = Parameters;
var Demolished;
(function (Demolished) {
    class EnityBase {
        constructor(gl, name) {
            this.gl = gl;
            this.name = name;
            this.loadResources().then(() => {
                this.init();
                this.target = this.createTarget(1, 1);
                this.backTarget = this.createTarget(1, 1);
            });
        }
        createTarget(width, height) {
            let gl = this.gl;
            let target = new RenderTarget(gl.createFramebuffer(), gl.createRenderbuffer(), gl.createTexture());
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
        }
        loadResources() {
            let urls = new Array();
            urls.push("entities/" + this.name + "/fragment.glsl");
            urls.push("entities/" + this.name + "/vertex.glsl");
            urls.push("entities/" + this.name + "/uniforms.json");
            return Promise.all(urls.map(url => fetch(url).then(resp => resp.text()))).then(result => {
                this.fragmetShader = result[0];
                this.vertexShader = result[1];
                return true;
            }).catch((reason) => {
                this.OnError(reason);
                return false;
            });
        }
        OnError(err) {
            console.log(err);
        }
        init() {
            let gl = this.gl;
            this.buffer = gl.createBuffer();
            this.currentProgram = gl.createProgram();
            let vs = this.createShader(gl, this.vertexShader, gl.VERTEX_SHADER);
            let fs = this.createShader(gl, this.fragmetShader, gl.FRAGMENT_SHADER);
            gl.attachShader(this.currentProgram, vs);
            gl.attachShader(this.currentProgram, fs);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.linkProgram(this.currentProgram);
            if (!gl.getProgramParameter(this.currentProgram, gl.LINK_STATUS)) {
                let info = gl.getProgramInfoLog(this.currentProgram);
                this.OnError("error -> " + info);
            }
            this.cacheUniformLocation(this.currentProgram, 'freq_data');
            this.cacheUniformLocation(this.currentProgram, 'freq_time');
            this.cacheUniformLocation(this.currentProgram, 'time');
            this.cacheUniformLocation(this.currentProgram, 'mouse');
            this.cacheUniformLocation(this.currentProgram, 'resolution');
            this.positionAttribute = gl.getAttribLocation(this.currentProgram, "surfacePosAttrib");
            gl.enableVertexAttribArray(this.positionAttribute);
            this.vertexPosition = gl.getAttribLocation(this.currentProgram, "position");
            gl.enableVertexAttribArray(this.vertexPosition);
            gl.useProgram(this.currentProgram);
            this.isLoaded = true;
        }
        cacheUniformLocation(program, label) {
            if (program.uniformsCache === undefined) {
                program.uniformsCache = {};
            }
            program.uniformsCache[label] = this.gl.getUniformLocation(program, label);
        }
        swapBuffers() {
            let tmp = this.target;
            this.target = this.backTarget;
            this.backTarget = tmp;
        }
        createShader(gl, src, type) {
            let shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            return shader;
        }
    }
    Demolished.EnityBase = EnityBase;
    class RenderTarget {
        constructor(frameBuffer, renderBuffer, texture) {
            this.frameBuffer = frameBuffer;
            this.renderBuffer = renderBuffer;
            this.texture = texture;
        }
    }
    Demolished.RenderTarget = RenderTarget;
    class AudioData {
        constructor(freqData, timeData, minDb, maxDb) {
            this.freqData = freqData;
            this.timeData = timeData;
            this.minDb = minDb;
            this.maxDb = maxDb;
            this.freqScale = 1 / (maxDb - minDb);
            this.freqOffset = minDb;
        }
        avg() {
            let arr = this.freqData;
            return 1 - (arr.reduce((p, c) => p + c, 0) / arr.byteLength);
        }
    }
    Demolished.AudioData = AudioData;
    class World {
        constructor() {
            this.width = 1;
            this.height = 1;
            this.centerX = 0;
            this.centerY = 0;
            this.parameters = new Parameters();
            this.parameters.startTime = Date.now(),
                this.parameters.time = 0;
            this.parameters.mouseX = 0.5;
            this.parameters.mouseY = 0.5;
            this.parameters.screenWidth = 500;
            this.parameters.screenHeight = 500,
                this.parameters.custom = {};
            this.assets = new Array();
            this.nodes = new Array();
            this.canvas = document.querySelector("#gl");
            this.gl = this.getRendringContext();
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.addEntity("plasma");
            this.currentProgram = this.nodes[0].currentProgram;
            this.addEventListeners();
            this.loadMusic();
        }
        getRendringContext() {
            let gl;
            gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
            gl.getExtension('OES_standard_derivatives');
            this.buffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), gl.STATIC_DRAW);
            return gl;
        }
        loadMusic() {
            let context = new AudioContext();
            window.fetch("assets/song.mp3").then((response) => {
                response.arrayBuffer().then((buffer) => {
                    context.decodeAudioData(buffer, (audioBuffer) => {
                        let bufferSource = context.createBufferSource();
                        this.audioAnalyser = context.createAnalyser();
                        bufferSource.buffer = audioBuffer;
                        bufferSource.loop = true;
                        this.audioAnalyser.smoothingTimeConstant = 0.2;
                        this.audioAnalyser.fftSize = 32;
                        this.audioData =
                            new AudioData(new Float32Array(32), new Float32Array(32), this.audioAnalyser.minDecibels, this.audioAnalyser.maxDecibels);
                        bufferSource.connect(this.audioAnalyser);
                        bufferSource.connect(context.destination);
                        bufferSource.start(0);
                        this.animate(); // todo: Fire OnReady event...
                    });
                });
            });
        }
        addEventListeners() {
            document.addEventListener("mousemove", (evt) => {
                this.parameters.mouseX = evt.clientX / window.innerWidth;
                this.parameters.mouseY = 1 - evt.clientY / window.innerHeight;
            });
        }
        addEntity(name) {
            const entity = new EnityBase(this.gl, name);
            this.nodes.push(entity);
            return entity;
        }
        init() {
            this.computeSurfaceCorners(); // todo: needs to be called OnResize
        }
        /**
         *
         *
         *
         * @memberOf World
         */
        animate() {
            requestAnimationFrame(() => {
                if (this.audioAnalyser) {
                    this.audioAnalyser.getFloatFrequencyData(this.audioData.freqData);
                    this.audioAnalyser.getFloatTimeDomainData(this.audioData.timeData);
                }
                this.animate();
            });
            this.renderEntities(this.nodes[0]);
        }
        /**
         * Calculate the rendering surface corners
         *
         *
         * @memberOf World
         */
        computeSurfaceCorners() {
            if (this.gl) {
                this.width = this.height * this.parameters.screenWidth / this.parameters.screenHeight;
                var halfWidth = this.width * 0.5, halfHeight = this.height * 0.5;
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
                    this.centerX - halfWidth, this.centerY - halfHeight,
                    this.centerX + halfWidth, this.centerY - halfHeight,
                    this.centerX - halfWidth, this.centerY + halfHeight,
                    this.centerX + halfWidth, this.centerY - halfHeight,
                    this.centerX + halfWidth, this.centerY + halfHeight,
                    this.centerX - halfWidth, this.centerY + halfHeight]), this.gl.STATIC_DRAW);
            }
        }
        renderEntities(ent) {
            let currentProgram = ent.currentProgram;
            let gl = this.gl;
            let buffer = this.buffer;
            if (!currentProgram)
                return;
            this.parameters.time = Date.now() - this.parameters.startTime;
            gl.useProgram(currentProgram);
            gl.uniform1fv(currentProgram.uniformsCache['freq_data'], this.audioData.freqData);
            gl.uniform1fv(currentProgram.uniformsCache['freq_time'], this.audioData.timeData);
            gl.uniform1f(currentProgram.uniformsCache['time'], this.parameters.time / 1000);
            gl.uniform2f(currentProgram.uniformsCache['mouse'], this.parameters.mouseX, this.parameters.mouseY);
            gl.uniform2f(currentProgram.uniformsCache['resolution'], this.canvas.width, this.canvas.height);
            gl.bindBuffer(gl.ARRAY_BUFFER, ent.buffer);
            gl.vertexAttribPointer(ent.positionAttribute, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(ent.vertexPosition, 2, gl.FLOAT, false, 0, 0);
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, ent.backTarget.texture);
            gl.bindFramebuffer(gl.FRAMEBUFFER, ent.target.frameBuffer);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            ent.swapBuffers();
        }
    }
    Demolished.World = World;
})(Demolished = exports.Demolished || (exports.Demolished = {}));


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

const demolished_1 = __webpack_require__(0);
class DemolishInstance {
    constructor() {
        this.world = new demolished_1.Demolished.World();
        // this.world.animate();
    }
}
document.addEventListener("DOMContentLoaded", () => {
    let d = new DemolishInstance();
    window["food"] = d;
});


/***/ })
/******/ ]);