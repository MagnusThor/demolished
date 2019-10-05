"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const demolished_1 = require("./src/demolished");
const CodeMirror = require("codemirror");
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
require("codemirror/addon/display/autorefresh");
require("codemirror/keymap/sublime");
const demolishedUtils_1 = require("./src/demolishedUtils");
const demolishedSound_1 = require("./src/demolishedSound");
const demoishedEditorHelper_1 = require("./src/ui/editor/demoishedEditorHelper");
const demolished2D_1 = require("./src/demolished2D");
const demolishedRecoder_1 = require("./src/demolishedRecoder");
const demolishedTimeline_1 = require("./src/demolishedTimeline");
const demolishedAudioWaveform_1 = require("./src/demolishedAudioWaveform");
const SpectrumAnalyzer_1 = require("./SpectrumAnalyzer");
const DemolishedStates_1 = require("./src/DemolishedStates");
const demolishedLoader_1 = require("./src/demolishedLoader");
class DemolishedEd {
    constructor() {
        this.isFullscreen = false;
        this.states = new DemolishedStates_1.DemolishedStates();
        this.editors = new Array();
        let Render2D = new demolished2D_1.Demolished2D(demolishedUtils_1.Utils.$("#canvas-spectrum"));
        this.spectrum = new SpectrumAnalyzer_1.SpectrumAnalyzer(Render2D.ctx);
        Render2D.addEntity(this.spectrum);
        Render2D.start(0);
        this.shaderCompiler = new demolishedUtils_1.ShaderCompiler();
        this.music = new demolishedSound_1.DemolishedStreamingMusic();
        this.engine = new demolished_1.Demolished.Rendering(demolishedUtils_1.Utils.$("#webgl"), demolishedUtils_1.Utils.$("#shader-view"), "entities/graph.json", this.music);
        this.timeEl = demolishedUtils_1.Utils.$(".time");
        let playback = demolishedUtils_1.Utils.$("#toogle-playback");
        let sound = demolishedUtils_1.Utils.$("#toggle-sound");
        let fullscreen = demolishedUtils_1.Utils.$("#btn-fullscreen");
        let immediate = demolishedUtils_1.Utils.$(".immediate");
        let resetTimers = demolishedUtils_1.Utils.$("#reset-clocks");
        let shaderResolution = demolishedUtils_1.Utils.$("#shader-resolution");
        let shaderWin = demolishedUtils_1.Utils.$("#shader-win");
        let record = demolishedUtils_1.Utils.$("#btn-record");
        record.addEventListener("click", () => {
            if (!this.recorder) {
                this.engine.resetClock(0);
                immediate.classList.remove("hide");
                let videoTrack = this.engine.canvas["captureStream"](60);
                let audioTracks = this.engine.audio.getTracks();
                this.recorder = new demolishedRecoder_1.DemolishedRecorder(videoTrack.getTracks()[0], audioTracks[0]);
                this.recorder.start(60);
                let p = demolishedUtils_1.Utils.el("p", "Recording");
                immediate.appendChild(p);
            }
            else {
                this.recorder.stop();
                let filename = Math.random().toString(36).substring(2) + ".webm";
                let p = demolishedUtils_1.Utils.el("p");
                let a = demolishedUtils_1.Utils.el("a", "Download recording", { download: filename, href: this.recorder.toBlob() });
                p.appendChild(a);
                immediate.appendChild(p);
            }
        });
        demolishedUtils_1.Utils.$$("*[data-close]").forEach((n) => {
            n.addEventListener("click", () => n.parentElement.classList.toggle("hide"));
        });
        demolishedUtils_1.Utils.$("#show-shaders").addEventListener("click", (evt) => {
            demolishedUtils_1.Utils.$("#shader-list").classList.toggle("hide");
        });
        let tabButtons = demolishedUtils_1.Utils.$$(".tab-caption");
        let tabs = demolishedUtils_1.Utils.$$(".tab");
        tabButtons.forEach((el) => {
            el.addEventListener("click", (evt) => {
                tabs.forEach((b) => {
                    b.classList.add("hide");
                });
                tabButtons.forEach((b) => {
                    b.classList.remove("tab-active");
                });
                let src = evt.srcElement;
                src.classList.add("tab-active");
                demolishedUtils_1.Utils.$("#" + src.dataset.target).classList.remove("hide");
                this.editors.forEach((cm, i) => {
                    cm.refresh();
                });
            });
        });
        shaderWin.addEventListener("dragend", (evt) => {
            let win = evt.target;
            win.style.left = (evt.clientX).toString() + "px";
            win.style.top = (evt.clientY).toString() + "px";
        });
        resetTimers.addEventListener("click", () => {
            this.engine.resetClock(0);
        });
        demolishedUtils_1.Utils.$("#btn-showconsole").addEventListener("click", () => {
            demolishedUtils_1.Utils.$(".immediate").classList.toggle("hide");
        });
        fullscreen.addEventListener("click", () => {
            let view = demolishedUtils_1.Utils.$("#shader-win");
            view.requestFullscreen();
            this.engine.resizeCanvas(view);
        });
        shaderResolution.addEventListener("change", () => {
            this.engine.resizeCanvas(demolishedUtils_1.Utils.$("#webgl"), parseInt(shaderResolution.value));
        });
        document.addEventListener("fullscreenchange", (e) => {
            let target = e.target;
            if (!this.isFullscreen) {
                target.classList.add("shader-fullscreen");
                this.engine.resizeCanvas(document.body);
            }
            else {
                target = demolishedUtils_1.Utils.$("#shader-view");
                target.classList.remove("shader-fullscreen");
                this.engine.resizeCanvas(target);
            }
            this.isFullscreen = !this.isFullscreen;
        });
        playback.addEventListener("click", () => {
            playback.classList.toggle("fa-play");
            playback.classList.toggle("fa-pause");
            this.engine.pause();
        });
        sound.addEventListener("click", () => {
            sound.classList.toggle("fa-volume-up");
            sound.classList.toggle("fa-volume-off");
            this.engine.mute();
        });
        this.engine.onFrame = (frame) => {
            this.spectrum.frequencData = this.music.getFrequenceData();
            this.timeLime.updateAudioPosition();
            this.timeEl.textContent = this.engine.audio.currentTime.toFixed(3).toString();
        };
        this.engine.onReady = () => {
            this.timeLime = new demolishedAudioWaveform_1.AudioWaveform(this.engine.audio.audioBuffer, this.engine.audio.getAudioEl());
            this.demoTimeline = new demolishedTimeline_1.Timeline("#current-time", this.engine.graph.duration);
            this.engine.entitiesCache.forEach((shader) => {
                const listEl = demolishedUtils_1.Utils.el("li", shader.name);
                listEl.addEventListener("click", () => {
                    this.setActiveShader(shader);
                });
                demolishedUtils_1.Utils.$("#shader-list ul").appendChild(listEl);
            });
            this.onReady();
            window.setTimeout(() => {
                this.engine.start(0);
                console.log("starting after 2000ms");
            }, 2000);
        };
        this.engine.onNext = (f) => {
            console.log("onNext->", f);
        };
        this.engine.onStop = () => {
        };
        this.engine.onStart = () => {
            let fragmentEditor = CodeMirror.fromTextArea(demolishedUtils_1.Utils.$("#fragment"), {
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
                autofocus: false,
                autorefresh: true,
                extraKeys: {
                    "Ctrl-S": function (instance) { alert(instance.getValue()); }
                }
            });
            this.helpers = new demoishedEditorHelper_1.DemoishedEditorHelper(fragmentEditor);
            this.shaderCompiler.onError = (shaderErrors) => {
                shaderErrors.forEach((err) => {
                    let errNode = demolishedUtils_1.Utils.el("abbr");
                    errNode.classList.add("error-info");
                    errNode.title = err.error;
                    fragmentEditor.setGutterMarker(err.line - 1, "note-gutter", errNode);
                    let p = demolishedUtils_1.Utils.el("p");
                    let m = demolishedUtils_1.Utils.el("mark", err.line.toString());
                    let s = demolishedUtils_1.Utils.el("span", err.error);
                    p.appendChild(m);
                    p.appendChild(s);
                    immediate.appendChild(p);
                });
            };
            this.shaderCompiler.onSuccess = (source) => {
                let shaderErrors = demolishedUtils_1.Utils.$$(".error-info");
                shaderErrors.forEach((el) => {
                    el.classList.remove("error-info");
                });
                this.engine.shaderEntity.setFragment(source);
            };
            fragmentEditor.on("change", (cm) => {
                let source = cm.getValue();
                if (source.length == 0 && !this.shaderCompiler.canCompile())
                    return;
                this.shaderCompiler.compile(source, this.engine.shared);
                this.states.set("fragmentChange", true);
            });
            let vertexEditor = CodeMirror.fromTextArea(demolishedUtils_1.Utils.$("#vertex"), {
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
                autofocus: false,
                autorefresh: true
            });
            vertexEditor.on("change", (cm) => {
                let source = cm.getValue();
                console.log("vertext changed, set and compile vertex", source);
            });
            this.editors.push(vertexEditor, fragmentEditor);
            this.editors[1].getDoc().setValue(this.engine.shaderEntity.fragmentShader);
            this.editors[0].getDoc().setValue(this.engine.shaderEntity.vertexShader);
            this.states.add("fragmentChange").listen("fragmentChange", (a, b) => {
                let el = demolishedUtils_1.Utils.$("#frag i");
                a ? el.classList.add("hide") : el.classList.remove("hide");
            });
        };
        window.onerror = () => {
            this.engine.stop();
        };
        window.onresize = () => {
            Render2D.canvas.style.width = window.innerWidth + "px";
            Render2D.canvas.style.height = window.innerHeight + "px";
        };
    }
    static getIntance() {
        return new DemolishedEd();
    }
    onReady() {
        demolishedUtils_1.Utils.$(".loader").classList.add("hide");
    }
    static showJSON(data, t) {
        t.textContent = JSON.stringify(data);
    }
    segmentChange(...args) {
        console.log("...", args);
    }
    loadShader(name) {
        demolishedUtils_1.Utils.$("div.partial-loader").classList.toggle("hide");
        let urls = new Array();
        urls.push("entities/shaders/" + name + "/fragment.glsl");
        urls.push("entities/shaders/" + name + "/vertex.glsl");
        return Promise.all(urls.map((url) => __awaiter(this, void 0, void 0, function* () {
            const resp = yield demolishedLoader_1.default(url);
            return resp.text();
        }))).then(result => {
            demolishedUtils_1.Utils.$("div.partial-loader").classList.toggle("hide");
            return result;
        }).catch((reason) => {
            return new Array();
        });
    }
    setActiveShader(shader) {
        this.loadShader(shader.name).then((source) => {
            this.engine.shaderEntity = shader;
            this.editors[1].getDoc().setValue(source[0]);
            this.editors[0].getDoc().setValue(source[1]);
        });
    }
}
exports.DemolishedEd = DemolishedEd;
document.addEventListener("DOMContentLoaded", () => {
    window["_demo"] = DemolishedEd.getIntance();
});
