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
var demoishedEditorHelper_1 = require("./src/ui/editor/demoishedEditorHelper");
var DemolishedEd = (function () {
    function DemolishedEd() {
        var _this = this;
        this.shaderCompiler = new demolishedUtils_1.ShaderCompiler();
        var webGlCanvas = document.querySelector("#webgl");
        var music = new demolishedSound_1.DemolishedStreamingMusic();
        this.webGlrendering = new demolished_1.Demolished.Rendering(webGlCanvas, this.select("#shader-view"), "entities/graph.json", music);
        var timeEl = document.querySelector(".time");
        timeEl.addEventListener("click", function () {
            _this.webGlrendering.uniforms.time = 0;
            _this.webGlrendering.resetClock(0);
        });
        this.select("#btn-showconsole").addEventListener("click", function () {
            _this.select(".immediate").classList.toggle("hide");
        });
        var playback = this.select("#toogle-playback");
        var sound = this.select("#toggle-sound");
        var fullscreen = this.select("#btn-fullscreen");
        fullscreen.addEventListener("click", function () {
            var view = _this.select("#webgl");
            view.webkitRequestFullscreen();
        });
        document.addEventListener("webkitfullscreenchange", function (evt) {
            var target = document.webkitFullscreenElement;
            if (target) {
                target.classList.add("shader-fullscreen");
                _this.webGlrendering.resizeCanvas(document.body);
            }
            else {
                target = _this.select("#shader-view");
                target.classList.remove("shader-fullscreen");
                _this.webGlrendering.resizeCanvas(target);
            }
        });
        playback.addEventListener("click", function () {
            playback.classList.toggle("fa-play");
            playback.classList.toggle("fa-pause");
            _this.webGlrendering.pause();
        });
        sound.addEventListener("click", function () {
            sound.classList.toggle("fa-volume-up");
            sound.classList.toggle("fa-volume-off");
            _this.webGlrendering.mute();
        });
        this.webGlrendering.onFrame = function (frame) {
            timeLine.value = parseInt(frame.ms).toString();
            timeEl.textContent = frame.min + ":" + frame.sec + ":" + (frame.ms / 10).toString().match(/^-?\d+(?:\.\d{0,-1})?/)[0];
        };
        var timeLine = this.select("#current-time");
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
            var mirror = _this.select("#fragment");
            mirror.textContent = shader;
            var lastCompile = performance.now();
            var editor = CodeMirror.fromTextArea(_this.select("#fragment"), {
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
            var helpers = new demoishedEditorHelper_1.DemoishedEditorHelper(editor);
            var immediate = _this.select(".immediate");
            var isCompile = false;
            editor.on("change", function (cm) {
                if (isCompile)
                    return;
                if (-(lastCompile - performance.now()) / 1000 > 0.5) {
                    isCompile = true;
                    var fs = cm.getValue();
                    var vs = _this.webGlrendering.currentTimeFragment.entityShader.vertexShader;
                    var shaderErrors = _this.shaderCompiler.compile(fs);
                    lastCompile = performance.now();
                    if (shaderErrors.length === 0) {
                        immediate.innerHTML = "";
                        _this.webGlrendering.currentTimeFragment.entityShader.reCompile(fs);
                        if (!immediate.classList.contains("hide"))
                            immediate.classList.add("hide");
                    }
                    var errInfo = document.querySelectorAll(".error-info");
                    for (var i = 0; i < errInfo.length; i++) {
                        errInfo[i].classList.remove("error-info");
                    }
                    shaderErrors.length === 0 ? _this.select("#btn-showconsole").classList.remove("red") : _this.select("#btn-showconsole").classList.add("red");
                    shaderErrors.forEach(function (err) {
                        var errNode = document.createElement("abbr");
                        errNode.classList.add("error-info");
                        errNode.title = err.error;
                        editor.setGutterMarker(err.line - 1, "note-gutter", errNode);
                        var p = document.createElement("p");
                        var m = document.createElement("mark");
                        var s = document.createElement("span");
                        s.textContent = err.error;
                        m.textContent = err.line.toString();
                        p.appendChild(m);
                        p.appendChild(s);
                        immediate.appendChild(p);
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
    DemolishedEd.getIntance = function () {
        return new DemolishedEd();
    };
    DemolishedEd.prototype.onReady = function () {
        this.select(".loader").classList.add("hide");
    };
    DemolishedEd.prototype.select = function (query, parent) {
        return parent ? parent.querySelector(query) : document.querySelector(query);
    };
    return DemolishedEd;
}());
exports.DemolishedEd = DemolishedEd;
document.addEventListener("DOMContentLoaded", function () {
    DemolishedEd.getIntance();
});
