"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var demolished_1 = require("./src/demolished");
var demolishedCanvas_1 = require("./src/demolishedCanvas");
var scroller_1 = require("./entities/2d/scroller/scroller");
var ExampleDemo = (function () {
    function ExampleDemo() {
        var _this = this;
        var webGlCanvas = document.querySelector("#gl");
        var canavs2d = document.querySelector("#canvas2d");
        this.canvasRendering = new demolishedCanvas_1.DemolishedCanvas(canavs2d);
        this.canvasRendering.addEntity(new scroller_1.Scroller2D(this.canvasRendering.ctx, "This is a scroller.... old and gold.."));
        this.webGlrendering = new demolished_1.Demolished.Rendering(webGlCanvas, "entities/graph.json");
        this.webGlrendering.onReady = function () {
            _this.onReady();
            window.setTimeout(function () {
                document.querySelector(".loader").classList.add("hide");
                _this.webGlrendering.start(0);
                _this.canvasRendering.start(0);
            }, 3000);
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
    ExampleDemo.prototype.onReady = function () { };
    return ExampleDemo;
}());
exports.ExampleDemo = ExampleDemo;
document.addEventListener("DOMContentLoaded", function () {
    var demo = new ExampleDemo();
});
