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
