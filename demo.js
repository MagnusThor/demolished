"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var demolished_1 = require("./src/demolished");
var DemolishedSonant_1 = require("./src/DemolishedSonant");
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
            }, 2000);
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
