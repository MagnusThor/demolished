"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var demolished_1 = require("./src/demolished");
var demolishedCanvas_1 = require("./src/demolishedCanvas");
var scroller_1 = require("./entities/2d/scroller/scroller");
var demolihedTrans_1 = require("./src/demolihedTrans");
var scrollText = "This is fucking it, we love and support sami terrorism but hate everyting else, maybe we can save an artic fox just because it is evil. Barbie is fucking wasted on norrlaendskt haembrant and russian krokodil.  Speedfisters is going to die by our knife. Norrland is filling our souls with the deepest insanity and hate towards everything that can die. Spraeng bort allt soeder om Dalaelven! Djaevla mesar!   Fuck this shit! It's time to go out in the northern wilderness and become one with all the fucking insane bears and wolves. All that will be left is bloody corpses, ready for nature to fuck with all it's satanic evil.  btw, fuck a raindeer.  spitvaelling and blodkams!        ";
var HCHDemo = (function () {
    function HCHDemo() {
        var _this = this;
        this.transitions = new demolihedTrans_1.DemolishedTrans("#trans", { timeLine: [
                {
                    name: "intro",
                    classes: ["elk",],
                    start: 12500
                },
                {
                    name: "skog",
                    classes: ["elk"],
                    start: 28500
                },
                {
                    name: "blod",
                    classes: ["elk"],
                    start: 42500
                },
                {
                    name: "ren",
                    classes: ["elk"],
                    start: 55750
                },
                {
                    name: "hund",
                    classes: ["elk"],
                    start: 87500
                }
            ]
        });
        var webGlCanvas = document.querySelector("#webgl");
        var canavs2d = document.querySelector("#simpleCanvas");
        this.canvasRendering = new demolishedCanvas_1.DemolishedCanvas(canavs2d);
        this.canvasRendering.addEntity(new scroller_1.Scroller2D(this.canvasRendering.ctx, scrollText));
        this.webGlrendering = new demolished_1.Demolished.Rendering(webGlCanvas, "entities/graph.json", this.canvasRendering);
        this.webGlrendering.onReady = function () {
            _this.onReady();
            window.setTimeout(function () {
                document.querySelector(".loader").classList.add("hide");
                _this.webGlrendering.start(0);
                window.setTimeout(function () {
                    _this.canvasRendering.start(0);
                }, 105 * 1000);
                _this.transitions.start(0);
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
        document.addEventListener("keyup", function (e) {
            if (e.keyCode === 13)
                console.log(_this.webGlrendering.uniforms);
        });
    }
    HCHDemo.prototype.onReady = function () { };
    return HCHDemo;
}());
exports.HCHDemo = HCHDemo;
document.addEventListener("DOMContentLoaded", function () {
    var demo = new HCHDemo();
});
