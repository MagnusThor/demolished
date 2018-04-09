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
