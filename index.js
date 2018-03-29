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
var demolished2D_1 = require("./src/demolished2D");
var SpectrumAnalyzer = (function (_super) {
    __extends(SpectrumAnalyzer, _super);
    function SpectrumAnalyzer(ctx) {
        var _this = _super.call(this, "spectrumAnalyzer", ctx) || this;
        _this.ctx = ctx;
        _this.active = true;
        _this.bars = 60;
        _this.ctx.fillStyle = "#ffffff";
        _this.ctx.strokeStyle = "#ffffff";
        _this.frequencData = new Uint8Array(8192);
        return _this;
    }
    SpectrumAnalyzer.prototype.update = function (time) {
        var sum = 0;
        var binSize = Math.floor(8192 / this.bars);
        for (var i = 0; i < this.bars; i += 1) {
            sum = 0;
            for (var j = 0; j < binSize; j += 1) {
                sum += this.frequencData[(i * binSize) + j];
            }
            var average = sum / binSize;
            var barWith = this.ctx.canvas.width / this.bars;
            var scaled_average = (average / 256) * this.height;
            this.ctx.fillRect(i * barWith + 20, this.ctx.canvas.height, barWith - 2, -scaled_average);
        }
    };
    return SpectrumAnalyzer;
}(demolished2D_1.BaseEntity2D));
exports.SpectrumAnalyzer = SpectrumAnalyzer;
var DemolishedEd = (function () {
    function DemolishedEd() {
        var _this = this;
        var Render2D = new demolished2D_1.Demolished2D(demolishedUtils_1.Utils.$("#canvas-spectrum"));
        this.spectrum = new SpectrumAnalyzer(Render2D.ctx);
        Render2D.addEntity(this.spectrum);
        Render2D.start(0);
        this.shaderCompiler = new demolishedUtils_1.ShaderCompiler();
        this.music = new demolishedSound_1.DemolishedStreamingMusic();
        this.engine = new demolished_1.Demolished.Rendering(demolishedUtils_1.Utils.$("#webgl"), demolishedUtils_1.Utils.$("#shader-view"), "entities/graph.json", this.music);
        var timeEl = demolishedUtils_1.Utils.$(".time");
        var playback = demolishedUtils_1.Utils.$("#toogle-playback");
        var sound = demolishedUtils_1.Utils.$("#toggle-sound");
        var fullscreen = demolishedUtils_1.Utils.$("#btn-fullscreen");
        var immediate = demolishedUtils_1.Utils.$(".immediate");
        var timeLine = demolishedUtils_1.Utils.$("#current-time");
        var shaderResolution = demolishedUtils_1.Utils.$("#shader-resolution");
        timeEl.addEventListener("click", function () {
            _this.engine.uniforms.time = 0;
            _this.engine.resetClock(0);
        });
        demolishedUtils_1.Utils.$("#btn-showconsole").addEventListener("click", function () {
            demolishedUtils_1.Utils.$(".immediate").classList.toggle("hide");
        });
        fullscreen.addEventListener("click", function () {
            var view = demolishedUtils_1.Utils.$("#webgl");
            view.webkitRequestFullscreen();
        });
        shaderResolution.addEventListener("change", function (evt) {
            _this.engine.resizeCanvas(demolishedUtils_1.Utils.$("#shader-view"), parseInt(shaderResolution.value));
        });
        document.addEventListener("webkitfullscreenchange", function (evt) {
            var target = document.webkitFullscreenElement;
            if (target) {
                target.classList.add("shader-fullscreen");
                _this.engine.resizeCanvas(document.body);
            }
            else {
                target = demolishedUtils_1.Utils.$("#shader-view");
                target.classList.remove("shader-fullscreen");
                _this.engine.resizeCanvas(target);
            }
        });
        playback.addEventListener("click", function () {
            playback.classList.toggle("fa-play");
            playback.classList.toggle("fa-pause");
            _this.engine.pause();
        });
        sound.addEventListener("click", function () {
            sound.classList.toggle("fa-volume-up");
            sound.classList.toggle("fa-volume-off");
            _this.engine.mute();
        });
        this.engine.onFrame = function (frame) {
            _this.spectrum.frequencData = _this.music.getFrequenceData();
            timeLine.style.width = ((parseInt(frame.ms) / 386400) * 100.).toString() + "%";
            timeEl.textContent = frame.min + ":" + frame.sec + ":" + (frame.ms / 10).toString().match(/^-?\d+(?:\.\d{0,-1})?/)[0];
        };
        this.engine.onReady = function () {
            _this.onReady();
            window.setTimeout(function () {
                _this.engine.start(0);
            }, 2000);
        };
        this.engine.onNext = function (frameInfo) {
        };
        this.engine.onStop = function () {
        };
        this.engine.onStart = function () {
            var shader = _this.engine.currentTimeFragment.entityShader.fragmetShader;
            var mirror = demolishedUtils_1.Utils.$("#fragment");
            mirror.textContent = shader;
            var lastCompile = performance.now();
            var editor = CodeMirror.fromTextArea(demolishedUtils_1.Utils.$("#fragment"), {
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
            _this.helpers = new demoishedEditorHelper_1.DemoishedEditorHelper(editor);
            _this.shaderCompiler.onError = function (shaderErrors) {
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
            };
            _this.shaderCompiler.onSuccess = function (fs) {
                var shaderErrors = demolishedUtils_1.Utils.$$(".error-info");
                shaderErrors.forEach(function (el) {
                    el.classList.remove("error-info");
                });
                _this.engine.currentTimeFragment.entityShader.reCompile(fs);
            };
            editor.on("change", function (cm) {
                var fs = cm.getValue();
                if (fs.length == 0 && !_this.shaderCompiler.canCompile())
                    return;
                var vs = _this.engine.currentTimeFragment.entityShader.vertexShader;
                _this.shaderCompiler.compile(fs);
            });
        };
        window.onerror = function () {
            _this.engine.stop();
        };
        window.onresize = function () {
            Render2D.canvas.style.width = window.innerWidth + "px";
            Render2D.canvas.style.height = window.innerHeight + "px";
        };
    }
    DemolishedEd.getIntance = function () {
        return new DemolishedEd();
    };
    DemolishedEd.prototype.onReady = function () {
        demolishedUtils_1.Utils.$(".loader").classList.add("hide");
    };
    return DemolishedEd;
}());
exports.DemolishedEd = DemolishedEd;
document.addEventListener("DOMContentLoaded", function () {
    DemolishedEd.getIntance();
});
