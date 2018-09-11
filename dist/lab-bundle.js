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
/******/ 	return __webpack_require__(__webpack_require__.s = 37);
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

/***/ 31:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DemolishedConfig = (function () {
    function DemolishedConfig() {
        this.configuration = new Map();
    }
    DemolishedConfig.getInstance = function () {
        return new DemolishedConfig();
    };
    DemolishedConfig.prototype.load = function (key) {
        return this.cast(key);
    };
    DemolishedConfig.prototype.cast = function (key) {
        return this.configuration.get(key);
    };
    DemolishedConfig.prototype.save = function (key, value) {
        this.configuration.set(key, value);
    };
    DemolishedConfig.prototype.loadStore = function () {
        var _this = this;
        this.configuration.forEach(function (a, b) {
            _this.configuration.set(b, JSON.parse(a));
        });
    };
    DemolishedConfig.prototype.updateStore = function () {
        this.configuration.forEach(function (a, b) {
            localStorage.setItem(b, JSON.stringify(a));
        });
    };
    return DemolishedConfig;
}());
exports.DemolishedConfig = DemolishedConfig;


/***/ }),

/***/ 37:
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
var demolished2D_1 = __webpack_require__(6);
var demolishedConfig_1 = __webpack_require__(31);
var demolishedModels_1 = __webpack_require__(1);
var TextEffect = (function (_super) {
    __extends(TextEffect, _super);
    function TextEffect(name, ctx, text, x, y, font) {
        var _this = _super.call(this, name, ctx) || this;
        _this.text = text;
        _this.x = x;
        _this.y = y;
        _this.font = font;
        _this.active = true;
        return _this;
    }
    TextEffect.prototype.update = function (time) {
        var ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.font = this.font;
        var dx = this.width / 2;
        var dy = this.height / 2;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 10;
        var sx = Math.random() * 2;
        var sy = Math.random() * 2;
        ctx.translate(sx, sy);
        ctx.strokeRect(20, 20, 512 - 40, 512 - 40);
        ctx.stroke();
        ctx.fillText(this.text, this.x, this.y, this.width - 120);
        ctx.restore();
    };
    ;
    return TextEffect;
}(demolished2D_1.BaseEntity2D));
exports.TextEffect = TextEffect;
var Lab2d = (function () {
    function Lab2d(el) {
        var Render2D = new demolished2D_1.Demolished2D(el, 512, 512);
        Render2D.addEntity(new TextEffect("textBlock", Render2D.ctx, "CODE", 60, 240, "128px 'Arial'"));
        Render2D.addEntity(new TextEffect("textBlock", Render2D.ctx, "FOO BAR", 80, 380, "bold 128px 'Arial'"));
        Render2D.start(0);
        var store = new demolishedConfig_1.DemolishedConfig();
        store.loadStore();
        store.save("foo", 1);
        store.save("bar", "Hello World");
        store.save("timeFragment", new demolishedModels_1.TimeFragment("shader", 0, 2000, [100, 200]));
        var tf = store.load("timeFragment");
        store.updateStore();
    }
    Lab2d.getInstance = function (el) {
        return new this(el);
    };
    return Lab2d;
}());
exports.Lab2d = Lab2d;
document.addEventListener("DOMContentLoaded", function () {
    Lab2d.getInstance(document.querySelector("#foo"));
});


/***/ }),

/***/ 6:
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
    BaseEntity2D.prototype.getPixels = function () {
        return this.ctx.getImageData(0, 0, this.width, this.height);
    };
    BaseEntity2D.prototype.putPixels = function () {
        throw "not implemented";
    };
    return BaseEntity2D;
}());
exports.BaseEntity2D = BaseEntity2D;
var Point3D = (function () {
    function Point3D(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Point3D.prototype.rotateX = function (angle) {
        var rad, cosa, sina, y, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        y = this.y * cosa - this.z * sina;
        z = this.y * sina + this.z * cosa;
        return new Point3D(this.x, y, z);
    };
    Point3D.prototype.rotateY = function (angle) {
        var rad, cosa, sina, x, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        z = this.z * cosa - this.x * sina;
        x = this.z * sina + this.x * cosa;
        return new Point3D(x, this.y, z);
    };
    Point3D.prototype.rotateZ = function (angle) {
        var rad, cosa, sina, x, y;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        x = this.x * cosa - this.y * sina;
        y = this.x * sina + this.y * cosa;
        return new Point3D(x, y, this.z);
    };
    Point3D.prototype.length = function () {
        var length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        return length;
    };
    Point3D.prototype.scale = function (scale) {
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
    };
    Point3D.prototype.normalize = function () {
        var lengthval = this.length();
        if (lengthval != 0) {
            this.x /= lengthval;
            this.y /= lengthval;
            this.z /= lengthval;
            return true;
        }
        else {
            return false;
        }
    };
    Point3D.prototype.angle = function (bvector) {
        var anorm = new Point3D(this.x, this.y, this.z);
        anorm.normalize();
        var bnorm = new Point3D(bvector.x, bvector.y, bvector.z);
        bnorm.normalize();
        var dotval = anorm.dot(bnorm);
        return Math.acos(dotval);
    };
    Point3D.prototype.cross = function (vectorB) {
        var tempvec = new Point3D(this.x, this.y, this.z);
        tempvec.x = (this.y * vectorB.z) - (this.z * vectorB.y);
        tempvec.y = (this.z * vectorB.x) - (this.x * vectorB.z);
        tempvec.z = (this.x * vectorB.y) - (this.y * vectorB.x);
        this.x = tempvec.x;
        this.y = tempvec.y;
        this.z = tempvec.z;
    };
    Point3D.prototype.dot = function (vectorB) {
        return this.x * vectorB.x + this.y * vectorB.y + this.z * vectorB.z;
    };
    Point3D.prototype.project = function (width, height, fov, distance) {
        var factor, x, y;
        factor = fov / (distance + this.z);
        x = this.x * factor + width / 2;
        y = this.y * factor + height / 2;
        return new Point3D(x, y, this.z);
    };
    return Point3D;
}());
exports.Point3D = Point3D;
var Demolished2D = (function () {
    function Demolished2D(canvas, w, h) {
        this.canvas = canvas;
        this.w = w;
        this.entities = new Array();
        this.ctx = canvas.getContext("2d");
        this.animationStartTime = 0;
        if (!w && !h)
            this.resizeCanvas();
    }
    Demolished2D.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    };
    Demolished2D.prototype.animate = function (time) {
        var _this = this;
        var animationTime = time - this.animationStartTime;
        this.animationFrameId = requestAnimationFrame(function (_time) {
            _this.animate(_time);
        });
        this.renderEntities(time);
    };
    Demolished2D.prototype.addEntity = function (ent) {
        this.entities.push(ent);
    };
    Demolished2D.prototype.resizeCanvas = function () {
        var width = window.innerWidth / 2;
        var height = window.innerHeight / 2;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    };
    Demolished2D.prototype.renderEntities = function (time) {
        this.clear();
        this.entities.forEach(function (ent) {
            ent.update(time);
        });
    };
    Demolished2D.prototype.start = function (startTime) {
        this.animate(startTime);
    };
    return Demolished2D;
}());
exports.Demolished2D = Demolished2D;


/***/ })

/******/ });