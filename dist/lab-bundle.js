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
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
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
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./lab2d.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lab2d.js":
/*!******************!*\
  !*** ./lab2d.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nvar __extends = (this && this.__extends) || (function () {\n    var extendStatics = Object.setPrototypeOf ||\n        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };\n    return function (d, b) {\n        extendStatics(d, b);\n        function __() { this.constructor = d; }\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n    };\n})();\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar demolished2D_1 = __webpack_require__(/*! ./src/demolished2D */ \"./src/demolished2D.js\");\nvar demolishedConfig_1 = __webpack_require__(/*! ./src/demolishedConfig */ \"./src/demolishedConfig.js\");\nvar demolishedModels_1 = __webpack_require__(/*! ./src/demolishedModels */ \"./src/demolishedModels.js\");\nvar TextEffect = (function (_super) {\n    __extends(TextEffect, _super);\n    function TextEffect(name, ctx, text, x, y, font) {\n        var _this = _super.call(this, name, ctx) || this;\n        _this.text = text;\n        _this.x = x;\n        _this.y = y;\n        _this.font = font;\n        _this.active = true;\n        return _this;\n    }\n    TextEffect.prototype.update = function (time) {\n        var ctx = this.ctx;\n        ctx.save();\n        ctx.fillStyle = \"#fff\";\n        ctx.font = this.font;\n        var dx = this.width / 2;\n        var dy = this.height / 2;\n        ctx.strokeStyle = \"#fff\";\n        ctx.lineWidth = 10;\n        var sx = Math.random() * 2;\n        var sy = Math.random() * 2;\n        ctx.translate(sx, sy);\n        ctx.strokeRect(20, 20, 512 - 40, 512 - 40);\n        ctx.stroke();\n        ctx.fillText(this.text, this.x, this.y, this.width - 120);\n        ctx.restore();\n    };\n    ;\n    return TextEffect;\n}(demolished2D_1.BaseEntity2D));\nexports.TextEffect = TextEffect;\nvar Lab2d = (function () {\n    function Lab2d(el) {\n        var Render2D = new demolished2D_1.Demolished2D(el, 512, 512);\n        Render2D.addEntity(new TextEffect(\"textBlock\", Render2D.ctx, \"CODE\", 60, 240, \"128px 'Arial'\"));\n        Render2D.addEntity(new TextEffect(\"textBlock\", Render2D.ctx, \"FOO BAR\", 80, 380, \"bold 128px 'Arial'\"));\n        Render2D.start(0);\n        var store = new demolishedConfig_1.DemolishedConfig();\n        store.loadStore();\n        store.save(\"foo\", 1);\n        store.save(\"bar\", \"Hello World\");\n        store.save(\"timeFragment\", new demolishedModels_1.TimeFragment(\"shader\", 0, 2000, [100, 200]));\n        var tf = store.load(\"timeFragment\");\n        store.updateStore();\n    }\n    Lab2d.getInstance = function (el) {\n        return new this(el);\n    };\n    return Lab2d;\n}());\nexports.Lab2d = Lab2d;\ndocument.addEventListener(\"DOMContentLoaded\", function () {\n    Lab2d.getInstance(document.querySelector(\"#foo\"));\n});\n\n\n//# sourceURL=webpack:///./lab2d.js?");

/***/ }),

/***/ "./src/demolished2D.js":
/*!*****************************!*\
  !*** ./src/demolished2D.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar BaseEntity2D = (function () {\n    function BaseEntity2D(name, ctx) {\n        this.name = name;\n        this.ctx = ctx;\n        this.width = ctx.canvas.width;\n        this.height = ctx.canvas.height;\n    }\n    BaseEntity2D.prototype.update = function (t) {\n    };\n    BaseEntity2D.prototype.getPixels = function () {\n        return this.ctx.getImageData(0, 0, this.width, this.height);\n    };\n    BaseEntity2D.prototype.putPixels = function () {\n        throw \"not implemented\";\n    };\n    return BaseEntity2D;\n}());\nexports.BaseEntity2D = BaseEntity2D;\nvar Point3D = (function () {\n    function Point3D(x, y, z) {\n        this.x = x;\n        this.y = y;\n        this.z = z;\n    }\n    Point3D.prototype.rotateX = function (angle) {\n        var rad, cosa, sina, y, z;\n        rad = angle * Math.PI / 180;\n        cosa = Math.cos(rad);\n        sina = Math.sin(rad);\n        y = this.y * cosa - this.z * sina;\n        z = this.y * sina + this.z * cosa;\n        return new Point3D(this.x, y, z);\n    };\n    Point3D.prototype.rotateY = function (angle) {\n        var rad, cosa, sina, x, z;\n        rad = angle * Math.PI / 180;\n        cosa = Math.cos(rad);\n        sina = Math.sin(rad);\n        z = this.z * cosa - this.x * sina;\n        x = this.z * sina + this.x * cosa;\n        return new Point3D(x, this.y, z);\n    };\n    Point3D.prototype.rotateZ = function (angle) {\n        var rad, cosa, sina, x, y;\n        rad = angle * Math.PI / 180;\n        cosa = Math.cos(rad);\n        sina = Math.sin(rad);\n        x = this.x * cosa - this.y * sina;\n        y = this.x * sina + this.y * cosa;\n        return new Point3D(x, y, this.z);\n    };\n    Point3D.prototype.length = function () {\n        var length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);\n        return length;\n    };\n    Point3D.prototype.scale = function (scale) {\n        this.x *= scale;\n        this.y *= scale;\n        this.z *= scale;\n    };\n    Point3D.prototype.normalize = function () {\n        var lengthval = this.length();\n        if (lengthval != 0) {\n            this.x /= lengthval;\n            this.y /= lengthval;\n            this.z /= lengthval;\n            return true;\n        }\n        else {\n            return false;\n        }\n    };\n    Point3D.prototype.angle = function (bvector) {\n        var anorm = new Point3D(this.x, this.y, this.z);\n        anorm.normalize();\n        var bnorm = new Point3D(bvector.x, bvector.y, bvector.z);\n        bnorm.normalize();\n        var dotval = anorm.dot(bnorm);\n        return Math.acos(dotval);\n    };\n    Point3D.prototype.cross = function (vectorB) {\n        var tempvec = new Point3D(this.x, this.y, this.z);\n        tempvec.x = (this.y * vectorB.z) - (this.z * vectorB.y);\n        tempvec.y = (this.z * vectorB.x) - (this.x * vectorB.z);\n        tempvec.z = (this.x * vectorB.y) - (this.y * vectorB.x);\n        this.x = tempvec.x;\n        this.y = tempvec.y;\n        this.z = tempvec.z;\n    };\n    Point3D.prototype.dot = function (vectorB) {\n        return this.x * vectorB.x + this.y * vectorB.y + this.z * vectorB.z;\n    };\n    Point3D.prototype.project = function (width, height, fov, distance) {\n        var factor, x, y;\n        factor = fov / (distance + this.z);\n        x = this.x * factor + width / 2;\n        y = this.y * factor + height / 2;\n        return new Point3D(x, y, this.z);\n    };\n    return Point3D;\n}());\nexports.Point3D = Point3D;\nvar Demolished2D = (function () {\n    function Demolished2D(canvas, w, h) {\n        this.canvas = canvas;\n        this.w = w;\n        this.entities = new Array();\n        this.ctx = canvas.getContext(\"2d\");\n        this.animationStartTime = 0;\n        if (!w && !h)\n            this.resizeCanvas();\n    }\n    Demolished2D.prototype.clear = function () {\n        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);\n    };\n    Demolished2D.prototype.animate = function (time) {\n        var _this = this;\n        var animationTime = time - this.animationStartTime;\n        this.animationFrameId = requestAnimationFrame(function (_time) {\n            _this.animate(_time);\n        });\n        this.renderEntities(time);\n    };\n    Demolished2D.prototype.addEntity = function (ent) {\n        this.entities.push(ent);\n    };\n    Demolished2D.prototype.resizeCanvas = function () {\n        var width = window.innerWidth / 2;\n        var height = window.innerHeight / 2;\n        this.canvas.width = width;\n        this.canvas.height = height;\n        this.canvas.style.width = window.innerWidth + 'px';\n        this.canvas.style.height = window.innerHeight + 'px';\n    };\n    Demolished2D.prototype.renderEntities = function (time) {\n        this.clear();\n        this.entities.forEach(function (ent) {\n            ent.update(time);\n        });\n    };\n    Demolished2D.prototype.start = function (startTime) {\n        this.animate(startTime);\n    };\n    return Demolished2D;\n}());\nexports.Demolished2D = Demolished2D;\n\n\n//# sourceURL=webpack:///./src/demolished2D.js?");

/***/ }),

/***/ "./src/demolishedConfig.js":
/*!*********************************!*\
  !*** ./src/demolishedConfig.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\nvar DemolishedConfig = (function () {\n    function DemolishedConfig() {\n        this.configuration = new Map();\n    }\n    DemolishedConfig.getInstance = function () {\n        return new DemolishedConfig();\n    };\n    DemolishedConfig.prototype.load = function (key) {\n        return this.cast(key);\n    };\n    DemolishedConfig.prototype.cast = function (key) {\n        return this.configuration.get(key);\n    };\n    DemolishedConfig.prototype.save = function (key, value) {\n        this.configuration.set(key, value);\n    };\n    DemolishedConfig.prototype.loadStore = function () {\n        var _this = this;\n        this.configuration.forEach(function (a, b) {\n            _this.configuration.set(b, JSON.parse(a));\n        });\n    };\n    DemolishedConfig.prototype.updateStore = function () {\n        this.configuration.forEach(function (a, b) {\n            localStorage.setItem(b, JSON.stringify(a));\n        });\n    };\n    return DemolishedConfig;\n}());\nexports.DemolishedConfig = DemolishedConfig;\n\n\n//# sourceURL=webpack:///./src/demolishedConfig.js?");

/***/ }),

/***/ "./src/demolishedModels.js":
/*!*********************************!*\
  !*** ./src/demolishedModels.js ***!
  \*********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
eval("\nObject.defineProperty(exports, \"__esModule\", { value: true });\n;\nvar RenderTarget = (function () {\n    function RenderTarget(frameBuffer, renderBuffer, texture) {\n        this.frameBuffer = frameBuffer;\n        this.renderBuffer = renderBuffer;\n        this.texture = texture;\n    }\n    return RenderTarget;\n}());\nexports.RenderTarget = RenderTarget;\nvar Graph = (function () {\n    function Graph() {\n    }\n    return Graph;\n}());\nexports.Graph = Graph;\nvar TimeFragment = (function () {\n    function TimeFragment(entity, start, stop, subeffects) {\n        this.entity = entity;\n        this.start = start;\n        this.stop = stop;\n        subeffects ? this.subeffects = subeffects : this.subeffects = new Array();\n        this._subeffects = this.subeffects.map(function (a) { return a; });\n    }\n    TimeFragment.prototype.reset = function () {\n        this.subeffects = this._subeffects.map(function (a) { return a; });\n    };\n    TimeFragment.prototype.setEntity = function (ent) {\n        this.entityShader = ent;\n    };\n    TimeFragment.prototype.init = function () {\n        var _this = this;\n        try {\n            this.subeffects.forEach(function (interval) {\n                var shader = _this.entityShader;\n                shader.addAction(\"$subeffects\", function (ent, tm) {\n                    if (_this.subeffects.find(function (a) { return a <= tm; })) {\n                        ent.subEffectId++;\n                        _this.subeffects.shift();\n                    }\n                });\n            });\n        }\n        catch (err) {\n            console.warn(err);\n        }\n    };\n    return TimeFragment;\n}());\nexports.TimeFragment = TimeFragment;\nvar Uniforms = (function () {\n    function Uniforms(width, height) {\n        this.screenWidth = width;\n        this.screenHeight = height;\n        this.time = 0;\n        this.timeTotal = 0;\n        this.mouseX = 0.5;\n        this.mouseY = 0.5;\n    }\n    Object.defineProperty(Uniforms.prototype, \"datetime\", {\n        get: function () {\n            var d = new Date();\n            return [d.getFullYear(), d.getMonth(), d.getDate(),\n                d.getHours() * 60.0 * 60 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000.0];\n        },\n        enumerable: true,\n        configurable: true\n    });\n    Uniforms.prototype.setScreen = function (w, h) {\n        this.screenWidth = w;\n        this.screenWidth = h;\n    };\n    return Uniforms;\n}());\nexports.Uniforms = Uniforms;\nvar Effect = (function () {\n    function Effect() {\n        this.textures = new Array();\n        this.type = 0;\n    }\n    return Effect;\n}());\nexports.Effect = Effect;\nvar AudioAnalyzerSettings = (function () {\n    function AudioAnalyzerSettings(fftSize, smoothingTimeConstant, minDecibels, maxDecibels) {\n        this.fftSize = fftSize;\n        this.smoothingTimeConstant = smoothingTimeConstant;\n        this.minDecibels = minDecibels;\n        this.maxDecibels = maxDecibels;\n    }\n    return AudioAnalyzerSettings;\n}());\nexports.AudioAnalyzerSettings = AudioAnalyzerSettings;\nvar AudioSettings = (function () {\n    function AudioSettings(audioFile, audioAnalyzerSettings, duration, bpm) {\n        this.audioAnalyzerSettings = audioAnalyzerSettings;\n        this.bpm = bpm;\n        this.audioFile;\n        this.duration = duration;\n    }\n    return AudioSettings;\n}());\nexports.AudioSettings = AudioSettings;\n\n\n//# sourceURL=webpack:///./src/demolishedModels.js?");

/***/ })

/******/ });