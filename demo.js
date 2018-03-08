"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var demolished_1 = require("./src/demolished");
var demolishedSound_1 = require("./src/demolishedSound");
var demolishedProperties_1 = require("./src/demolishedProperties");
var Demo = (function () {
    function Demo() {
        var _this = this;
        var webGlCanvas = document.querySelector("#webgl");
        var music = new demolishedSound_1.DemolishedSIDMusic();
        this.webGlrendering = new demolishedProperties_1.DemoishedProperty(new demolished_1.Demolished.Rendering(webGlCanvas, document.querySelector("foo"), "entities/demo.json", music)).getObserver();
        this.webGlrendering.onFrame = function (frame) {
        };
        this.webGlrendering.onReady = function () {
            demolishedProperties_1.DemolishedDialogBuilder.render(_this.webGlrendering, document.querySelector("#dlg > .prop-content"));
            _this.onReady();
            window.setTimeout(function () {
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
