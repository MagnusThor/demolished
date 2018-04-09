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
var demolished_1 = require("./src/demolished");
var demolishedSound_1 = require("./src/demolishedSound");
var demolishedEntity_1 = require("./src/demolishedEntity");
var demolishedModels_1 = require("./src/demolishedModels");
var demolishedTexture_1 = require("./src/demolishedTexture");
var MyDemo;
(function (MyDemo) {
    var CustomUniforms = (function (_super) {
        __extends(CustomUniforms, _super);
        function CustomUniforms(w, h) {
            return _super.call(this, w, h) || this;
        }
        return CustomUniforms;
    }(demolishedModels_1.Uniforms));
    var Ninelives = (function () {
        function Ninelives() {
            var canvas = document.createElement("canvas");
            var audio = new demolishedSound_1.DemolishedStreamingMusic();
            var uniforms = new CustomUniforms(canvas.width, canvas.height);
            var demo = new demolished_1.Demolished.Rendering(canvas, document.querySelector(".demo"), "", audio, uniforms);
            var assets = new Array();
            assets.push(new demolishedEntity_1.EntityTexture(this.renderTexture(function (pixel, x, y, w, h) {
                var t = this, m = Math;
                var kali = function (p) {
                    var e = 0, l = e;
                    for (var i = 0; i < 13; i++) {
                        var pl = l;
                        l = t.length(p);
                        var dot = t.dot(p, p);
                        p = t.func(p, function (v, i) {
                            return m.abs(v) / dot - 0.5;
                        });
                        e += m.exp(-1 / m.abs(l - pl));
                    }
                    return e;
                };
                var k = kali([t.toScale(x, w), t.toScale(y, w), 0]) * .18;
                return [Math.abs((k * 1.1) * 255), Math.abs((k * k * 1.3) * 255), Math.abs((k * k * k) * 255)];
            }), "iChannel0", 512, 512, 0));
            assets.push(new demolishedEntity_1.EntityTexture(this.renderTexture(function (pixel, x, y, w, h) {
                var r, b, g;
                x /= w;
                y /= h;
                var s = 10;
                var n = this.noise(s * x, s * y, .8);
                r = g = b = Math.round(255 * n);
                return [r, g, b];
            }), "iChannel1", 512, 512, 0));
            var as = new demolishedModels_1.AudioSettings();
            as.audioFile = "assets/plastic.mp3";
            as.bpm = 129;
            as.duration = 211800;
            as.audioAnalyzerSettings = new demolishedModels_1.AudioAnalyzerSettings(8192, .85, -90, -10);
            audio.createAudio(as).then(function () {
                demo.resizeCanvas(document.querySelector(".demo"), 2);
                demo.start(0);
            });
            var part = new demolishedModels_1.TimeFragment("nine-lives", 0, 384000);
            demo.timeFragments.push(part);
            demo.addEntity("nine-lives", assets);
            document.querySelector(".demo").appendChild(canvas);
            this.demolished = demo;
        }
        Ninelives.instance = function () {
            return new Ninelives();
        };
        Ninelives.prototype.renderTexture = function (fn) {
            var base64 = demolishedTexture_1.DemolishedTextureGen.createTexture(512, 512, fn);
            var image = new Image();
            image.src = base64;
            return image;
        };
        return Ninelives;
    }());
    MyDemo.Ninelives = Ninelives;
})(MyDemo = exports.MyDemo || (exports.MyDemo = {}));
document.addEventListener("DOMContentLoaded", function () {
    var p = MyDemo.Ninelives.instance();
    window["_demo"] = p;
});
