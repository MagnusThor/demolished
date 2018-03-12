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


import { Utils, ShaderCompiler, ShaderError } from './src/demolishedUtils'
import { SmartArray } from './src/demolishedSmartArray';
import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect } from './src/demolishedModels'

import { DemolishedStreamingMusic, DemolishedSIDMusic } from "./src/demolishedSound";
import { DemolishedDialogBuilder } from './src/demolishedProperties';
import { DemoishedEditorHelper } from './src/ui/editor/demoishedEditorHelper';
import { BaseEntity2D, IEntity2D, Demolished2D } from './src/demolished2D';


export class SpectrumAnalyzer extends BaseEntity2D implements IEntity2D {
    start: 0;
    stop: 0;
    active:true;
    constructor(public ctx: CanvasRenderingContext2D){
        super("spectrumAnalyzer",ctx);
        this.active = true;
        this.bars = 60;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.strokeStyle = "#ffffff";
        this.frequencData = new Uint8Array(8192);
    }
    bars: number;

    frequencData:Uint8Array

    update(time:number){
        let sum = 0;
        let binSize = Math.floor(8192 / this.bars);
        for(var i =0; i < this.bars;i+=1){
               sum = 0;
            for(var j = 0; j < binSize; j += 1){
                sum += this.frequencData[(i * binSize ) + j];
            }
            let average = sum / binSize;
            let barWith =this.ctx.canvas.width / this.bars;
            let scaled_average = (average / 256) * this.height;
            this.ctx.fillRect(i * barWith + 20,this.ctx.canvas.height
                ,barWith -2, -scaled_average);  
        }
    }
}

export class DemolishedEd {

    static getIntance(){
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

        let timeEl =Utils.$(".time");
        let playback = Utils.$("#toogle-playback");
        let sound = Utils.$("#toggle-sound");
        let fullscreen = Utils.$("#btn-fullscreen");
        let immediate = Utils.$(".immediate");
        let timeLine = Utils.$("#current-time") as HTMLInputElement;
        let shaderResolution = Utils.$("#shader-resolution") as HTMLInputElement;


        timeEl.addEventListener("click", () => {
            this.engine.uniforms.time = 0;
            this.engine.resetClock(0);
        });
        Utils.$("#btn-showconsole").addEventListener("click", () => {
            Utils.$(".immediate").classList.toggle("hide");
        });
        fullscreen.addEventListener("click", ()=>{
            let view = Utils.$("#webgl");
            view.webkitRequestFullscreen();
           
        });


        shaderResolution.addEventListener("change", (evt:Event) => {

            this.engine.resizeCanvas(Utils.$("#shader-view"),
            parseInt(shaderResolution.value));
        });


        document.addEventListener("webkitfullscreenchange",(evt) => {
            let target = document.webkitFullscreenElement;
            if(target){
             
                target.classList.add("shader-fullscreen");
                this.engine.resizeCanvas(document.body);
            
            }else{
                target = Utils.$("#shader-view");
                target.classList.remove("shader-fullscreen");
                this.engine.resizeCanvas(target);
            }
        });

        playback.addEventListener("click",() => {   
            playback.classList.toggle("fa-play");
            playback.classList.toggle("fa-pause")
            this.engine.pause();
        });

        sound.addEventListener("click",() => {
                sound.classList.toggle("fa-volume-up");
                sound.classList.toggle("fa-volume-off");
                this.engine.mute();
        });

        this.engine.onFrame = (frame) => {
            this.spectrum.frequencData = this.music.getFrequenceData();
            timeLine.style.width = ((parseInt(frame.ms) / 386400  ) * 100.  ).toString() + "%";
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
            let shader = this.engine.currentTimeFragment.entityShader.fragmetShader;
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
     
            this.shaderCompiler.onError = (shaderErrors:Array<ShaderError>) =>{
                
                       shaderErrors.forEach((err: ShaderError) => {
                        let errNode = document.createElement("abbr");
                        errNode.classList.add("error-info");
                        errNode.title = err.error;
                        editor.setGutterMarker(err.line - 1, "note-gutter", errNode);
                        // todo: refactor
                        let p = document.createElement("p");
                        let m = document.createElement("mark");
                        let s = document.createElement("span");
                        s.textContent = err.error;
                        m.textContent = err.line.toString();
                        p.appendChild(m);
                        p.appendChild(s);
                        immediate.appendChild(p);
                    });
            };
            this.shaderCompiler.onSuccess = (fs:string) =>{
                let shaderErrors = Utils.$$(".error-info"); 
                shaderErrors.forEach( (el:Element) => {
                    el.classList.remove("error-info");
                });
                this.engine.currentTimeFragment.entityShader.reCompile(fs);  
            }

            editor.on("change", (cm: CodeMirror) => {
                let fs = cm.getValue();
                if(fs.length == 0 && !this.shaderCompiler.canCompile() ) return;
                    let vs = this.engine.currentTimeFragment.entityShader.vertexShader;
                    this.shaderCompiler.compile(fs);
            });

        }
        window.onerror = () => {
            this.engine.stop();
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
     DemolishedEd.getIntance();
});


