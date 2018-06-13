import {
    Demolished
} from './src/demolished'


import * as CodeMirror from 'codemirror'
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/comment/comment';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/edit/closebrackets';
import 'codemirror/addon/wrap/hardwrap';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/fold/indent-fold';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/display/rulers';
import 'codemirror/addon/display/panel';
import 'codemirror/mode/clike/clike.js';

import 'codemirror/keymap/sublime';


import { Utils, ShaderCompiler, ShaderError } from './src/demolishedUtils';
import { SmartArray } from './src/demolishedSmartArray';
import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect } from './src/demolishedModels';

import { DemolishedStreamingMusic, DemolishedSIDMusic } from "./src/demolishedSound";
import { DemolishedDialogBuilder } from './src/demolishedProperties';
import { DemoishedEditorHelper } from './src/ui/editor/demoishedEditorHelper';
import { BaseEntity2D, IEntity2D, Demolished2D } from './src/demolished2D';
import { DemolishedRecorder } from './src/demolishedRecoder';
import { SSL_OP_NETSCAPE_DEMO_CIPHER_CHANGE_BUG } from 'constants';


export class SpectrumAnalyzer extends BaseEntity2D implements IEntity2D {
    start: 0;
    stop: 0;
    active: true;
    constructor(public ctx: CanvasRenderingContext2D) {
        super("spectrumAnalyzer", ctx);
        this.active = true;
        this.bars = 60;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.strokeStyle = "#ffffff";
        this.frequencData = new Uint8Array(8192);
    }
    bars: number;

    frequencData: Uint8Array

    // todo: scale_average must be relative
    update(time: number) {
        let sum = 0;
        let binSize = Math.floor(8192 / this.bars);
        for (var i = 0; i < this.bars; i += 1) {
            sum = 0;
            for (var j = 0; j < binSize; j += 1) {
                sum += this.frequencData[(i * binSize) + j];
            }
            let average = sum / binSize;
            let barWith = this.ctx.canvas.width / this.bars;
            let scaled_average = (average / 256) * this.height;
            this.ctx.fillRect(i * barWith + 20, this.ctx.canvas.height
                , barWith - 2, -scaled_average);
        }
    }
}

export class DemolishedEd {

    static getIntance() {
        return new DemolishedEd();
    }
    engine: Demolished.Rendering;
    music: DemolishedStreamingMusic;
    helpers: DemoishedEditorHelper;
    shaderCompiler: ShaderCompiler;
    onReady(): void {
        Utils.$(".loader").classList.add("hide");
    }

    private spectrum: SpectrumAnalyzer;

    public recorder: DemolishedRecorder;

    constructor() {

        let Render2D = new Demolished2D(Utils.$("#canvas-spectrum") as HTMLCanvasElement);
        this.spectrum = new SpectrumAnalyzer(Render2D.ctx);

        Render2D.addEntity(this.spectrum);
        Render2D.start(0);

        this.shaderCompiler = new ShaderCompiler();
        this.music = new DemolishedStreamingMusic();

        this.engine = new Demolished.Rendering(Utils.$("#webgl") as HTMLCanvasElement,
            Utils.$("#shader-view"),
            "entities/graph.json", this.music);

        // DemolishedDialogBuilder.render(this.webGlrendering,Utils.$("#dlg > .prop-content"));

        let timeEl = Utils.$(".time");
        let playback = Utils.$("#toogle-playback");
        let vertextCode = Utils.$("#vertex");

        let sound = Utils.$("#toggle-sound");
        let fullscreen = Utils.$("#btn-fullscreen");
        let immediate = Utils.$(".immediate");
        let resetTimers = Utils.$("#reset-clocks");
        let timeLine = Utils.$("#current-time") as HTMLInputElement;
        let shaderResolution = Utils.$("#shader-resolution") as HTMLInputElement;
        let shaderWin = Utils.$("#shader-win");

        let record = Utils.$("#btn-record");

        record.addEventListener("click", (evt: Event) => {

            if (!this.recorder) {
                
                this.engine.uniforms.time = 0;
                this.engine.resetClock(0);

                immediate.classList.remove("hide");

                let videoTrack = this.engine.canvas["captureStream"](60);
                let audioTracks = this.engine.audio.getTracks();

                this.recorder = new DemolishedRecorder(videoTrack.getTracks()[0],
                    audioTracks[0]
                );

                this.recorder.start(60);

                let p =Utils.el("p","Recording");
                immediate.appendChild(p);
                
            } else {
                this.recorder.stop();
                let filename = Math.random().toString(36).substring(2) + ".webm";
                let p = Utils.el("p");
                let a = Utils.el("a","Download recording",{ download:filename,href: this.recorder.toBlob()});        
                p.appendChild(a);
                immediate.appendChild(p);                
            }
        });

        let tabButtons = Utils.$$(".tab-caption");
        let tabs = Utils.$$(".tab")

        tabButtons.forEach((el: HTMLElement, idx: number) => {
            el.addEventListener("click", (evt: Event) => {
                tabs.forEach((b:HTMLElement) => {
                    b.classList.add("hide");
                });

                tabButtons.forEach((b:HTMLElement) => {
                    b.classList.remove("tab-active");
                });
                let src = evt.srcElement as HTMLElement;
                src.classList.add("tab-active");
                Utils.$("#" + src.dataset.target).classList.remove("hide");
            });
        });

        shaderWin.addEventListener("dragend", (evt: DragEvent) => {
            let win = evt.target as HTMLElement;
            win.style.left = (evt.clientX).toString() + "px";
            win.style.top = evt.clientY.toString() + "px";
        });

        resetTimers.addEventListener("click", () => {
            this.engine.uniforms.time = 0;
            this.engine.resetClock(0);
        });

        Utils.$("#btn-showconsole").addEventListener("click", () => {
            Utils.$(".immediate").classList.toggle("hide");
        });
        fullscreen.addEventListener("click", () => {
            let view = Utils.$("#webgl");
            view.webkitRequestFullscreen();

        });
        shaderResolution.addEventListener("change", (evt: Event) => {
            this.engine.resizeCanvas(Utils.$("#shader-view"),
                parseInt(shaderResolution.value));
        });
        document.addEventListener("webkitfullscreenchange", (evt) => {
            let target = document.webkitFullscreenElement;
            if (target) {
                target.classList.add("shader-fullscreen");
                this.engine.resizeCanvas(document.body);
            } else {
                target = Utils.$("#shader-view");
                target.classList.remove("shader-fullscreen");
                this.engine.resizeCanvas(target);
            }
        });

        playback.addEventListener("click", () => {
            playback.classList.toggle("fa-play");
            playback.classList.toggle("fa-pause")
            this.engine.pause();
        });

        sound.addEventListener("click", () => {
            sound.classList.toggle("fa-volume-up");
            sound.classList.toggle("fa-volume-off");
            this.engine.mute();
        });

        this.engine.onFrame = (frame) => {
            // todo:  Implmement a method the gives duration in milliscconds on IDemolishedAudio.,
            this.spectrum.frequencData = this.music.getFrequenceData();
            
            timeLine.style.width = ((parseInt(frame.ms) / this.engine.audio.duration) * 100.).toString() + "%";
            timeEl.textContent = frame.min + ":" + frame.sec + ":" + (frame.ms / 10).toString().match(/^-?\d+(?:\.\d{0,-1})?/)[0];
        };
        this.engine.onReady = () => {
            this.onReady();
            window.setTimeout(() => {
                this.engine.start(0);
            }, 2000);
        }
        this.engine.onNext = (frameInfo: any) => {
        };
        this.engine.onStop = () => {
        }
        this.engine.onStart = () => {
            
            let shader = this.engine.currentTimeFragment.entityShader.fragmentShader;

            this.engine.currentTimeFragment.init();

            let mirror = Utils.$("#fragment") as HTMLDivElement;
            mirror.textContent = shader;
            let lastCompile = performance.now();
            let editor = CodeMirror.fromTextArea(Utils.$("#fragment"),
                {
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
                }
            );


            this.helpers = new DemoishedEditorHelper(editor);


            /*
                   Längtar så efter Super Sara :-)
           */
            this.shaderCompiler.onError = (shaderErrors: Array<ShaderError>) => {
                shaderErrors.forEach((err: ShaderError) => {

                    let errNode = Utils.el("abbr");
                    
                    errNode.classList.add("error-info");
                    errNode.title = err.error;
                    editor.setGutterMarker(err.line - 1, "note-gutter", errNode);

                    let p =Utils.el("p");
                    let m = Utils.el("mark",err.line.toString());
                    let s =Utils.el("span",err.error);
                    p.appendChild(m);
                    p.appendChild(s);
                    immediate.appendChild(p);
                    
                });
            };
            this.shaderCompiler.onSuccess = (fs: string) => {
                let shaderErrors = Utils.$$(".error-info");
                shaderErrors.forEach((el: Element) => {
                    el.classList.remove("error-info");
                });

                this.engine.currentTimeFragment.entityShader.compile(fs);
            }

            editor.on("change", (cm: CodeMirror) => {
                let fs = cm.getValue();
                if (fs.length == 0 && !this.shaderCompiler.canCompile()) return;
                let vs = this.engine.currentTimeFragment.entityShader.vertexShader;
                this.shaderCompiler.compile(fs);
            });

        }
        window.onerror = () => {
            this.engine.stop();
        }
        window.onresize = () => {
            Render2D.canvas.style.width = window.innerWidth + "px";
            Render2D.canvas.style.height = window.innerHeight + "px";
        }

    }
}

document.addEventListener("DOMContentLoaded", () => {
    DemolishedEd.getIntance();
});


