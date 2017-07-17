"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var demolished_1 = require("./src/demolished");
var ExampleDemo = (function () {
    function ExampleDemo() {
        var _this = this;
        var canvas = document.querySelector("#gl");
        window.onerror = function () {
            _this.rendering.stop();
        };
        this.rendering = new demolished_1.Demolished.Rendering(canvas, "entities/graph.json");
        this.rendering.onReady = function () {
            _this.onReady();
            window.setTimeout(function () {
                document.querySelector(".loader").classList.add("hide");
                _this.rendering.start(0);
            }, 3000);
        };
        this.rendering.onStop = function () {
        };
        this.rendering.onStart = function () {
        };
        this.rendering.onNext = function (frameInfo) {
        };
    }
    ExampleDemo.prototype.onReady = function () { };
    return ExampleDemo;
}());
exports.ExampleDemo = ExampleDemo;
document.addEventListener("DOMContentLoaded", function () {
    var demo = new ExampleDemo();
});
