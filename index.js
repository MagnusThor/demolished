"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var demolished_1 = require("./src/demolished");
var CodeMirror = require("codemirror");
require("codemirror/addon/search/search");
require("codemirror/addon/search/searchcursor");
require("codemirror/addon/comment/comment");
require("codemirror/addon/dialog/dialog");
require("codemirror/addon/edit/matchbrackets");
require("codemirror/addon/edit/closebrackets");
require("codemirror/addon/wrap/hardwrap");
require("codemirror/addon/fold/foldcode");
require("codemirror/addon/fold/foldgutter");
require("codemirror/addon/fold/indent-fold");
require("codemirror/addon/hint/show-hint");
require("codemirror/addon/hint/javascript-hint");
require("codemirror/addon/display/rulers");
require("codemirror/addon/display/panel");
require("codemirror/mode/clike/clike.js");
require("codemirror/keymap/sublime");
var demolishedUtils_1 = require("./src/demolishedUtils");
var demolishedSound_1 = require("./src/demolishedSound");
var DemoEd = (function () {
    function DemoEd() {
        var _this = this;
        this.compiler = new demolishedUtils_1.ShaderCompiler();
        var webGlCanvas = document.querySelector("#webgl");
        var music = new demolishedSound_1.DemolishedStreamingMusic();
        this.webGlrendering = new demolished_1.Demolished.Rendering(webGlCanvas, "entities/graph.json", music);
        var timeEl = document.querySelector(".time");
        timeEl.addEventListener("click", function () {
            _this.webGlrendering.uniforms.time = 0;
            _this.webGlrendering.resetClock(0);
        });
        this.webGlrendering.onFrame = function (frame) {
            timeLine.value = parseInt(frame.ms).toString();
            timeEl.textContent = frame.min + ":" + frame.sec + ":" + (frame.ms / 10).toString().match(/^-?\d+(?:\.\d{0,-1})?/)[0];
        };
        var timeLine = document.querySelector("#current-time");
        this.webGlrendering.onReady = function () {
            _this.onReady();
            timeLine.setAttribute("max", "386400");
            window.setTimeout(function () {
                _this.webGlrendering.start(0);
            }, 2000);
        };
        this.webGlrendering.onStop = function () {
        };
        this.webGlrendering.onStart = function () {
            var shader = _this.webGlrendering.currentTimeFragment.entityShader.fragmetShader;
            var mirror = document.querySelector("#fragment");
            mirror.textContent = shader;
            var lastCompile = performance.now();
            var editor = CodeMirror.fromTextArea(document.querySelector("#fragment"), {
                gutters: ["note-gutter", "CodeMirror-linenumbers"],
                viewportMargin: Infinity,
                lineNumbers: true,
                matchBrackets: true,
                mode: 'x-shader/x-fragment',
                keyMap: 'sublime',
                autoCloseBrackets: true,
                showCursorWhenSelecting: true,
                theme: "monokai",
                indentUnit: 4,
                lineWrapping: true,
                autofocus: true
            });
            var isCompile = false;
            editor.on("change", function (cm) {
                if (isCompile)
                    return;
                console.clear();
                console.log(-(lastCompile - performance.now()) / 1000, -(lastCompile - performance.now()) / 1000 > 5.);
                if (-(lastCompile - performance.now()) / 1000 > 0.5) {
                    isCompile = true;
                    var fs = cm.getValue();
                    var vs = _this.webGlrendering.currentTimeFragment.entityShader.vertexShader;
                    var compleErrors = _this.compiler.compile(fs);
                    lastCompile = performance.now();
                    if (compleErrors.length === 0) {
                        console.log("set new fs");
                        _this.webGlrendering.currentTimeFragment.entityShader.reCompile(fs);
                    }
                    document.querySelectorAll(".error-info").forEach(function (e) {
                        e.classList.remove("error-info");
                    });
                    compleErrors.forEach(function (err) {
                        var errNode = document.createElement("abbr");
                        errNode.classList.add("error-info");
                        errNode.title = err.error;
                        editor.setGutterMarker(err.line - 1, "note-gutter", errNode);
                    });
                    isCompile = false;
                }
            });
        };
        this.webGlrendering.onNext = function (frameInfo) {
        };
        window.onerror = function () {
            _this.webGlrendering.stop();
        };
    }
    DemoEd.prototype.onReady = function () { };
    return DemoEd;
}());
exports.DemoEd = DemoEd;
document.addEventListener("DOMContentLoaded", function () {
    var demo = new DemoEd();
    window["demoEd"] = demo;
});
