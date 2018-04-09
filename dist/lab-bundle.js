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

/***/ 10:
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


/***/ }),

/***/ 38:
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
var demolished2D_1 = __webpack_require__(10);
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
        Render2D.addEntity(new TextEffect("textBlock", Render2D.ctx, "GIN & TONIC", 60, 240, "128px 'Arial'"));
        Render2D.addEntity(new TextEffect("textBlock", Render2D.ctx, "JENNY", 80, 380, "bold 128px 'Arial'"));
        Render2D.start(0);
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


/***/ })

/******/ });