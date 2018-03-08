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



export class DemolishedEd {

    static getIntance(){
        return new DemolishedEd();
    }


    webGlrendering: Demolished.Rendering;
    shaderCompiler: ShaderCompiler;
    onReady(): void { 
        this.select(".loader").classList.add("hide");
    }

    private select(query:string,parent?:Element):Element{
           return  parent ? parent.querySelector(query) : document.querySelector(query);
    }

    constructor() {

      

       

    
        this.shaderCompiler = new ShaderCompiler();

        let webGlCanvas = document.querySelector("#webgl") as HTMLCanvasElement;
     
        let music = new DemolishedStreamingMusic();

        this.webGlrendering = new Demolished.Rendering(webGlCanvas,
            this.select("#shader-view"),
            "entities/graph.json", music);

       // DemolishedDialogBuilder.render(this.webGlrendering,this.select("#dlg > .prop-content"));

        var timeEl = document.querySelector(".time");

        timeEl.addEventListener("click", () => {
            this.webGlrendering.uniforms.time = 0;
            this.webGlrendering.resetClock(0);
        });

        this.select("#btn-showconsole").addEventListener("click", () => {
            this.select(".immediate").classList.toggle("hide");
        });

        let playback = this.select("#toogle-playback");
        let sound = this.select("#toggle-sound");
        let fullscreen = this.select("#btn-fullscreen");

        fullscreen.addEventListener("click", ()=>{
            let view = this.select("#webgl");
            view.webkitRequestFullscreen();
           
        });

        document.addEventListener("webkitfullscreenchange",(evt) => {
            let target = document.webkitFullscreenElement;
            if(target){
             
                target.classList.add("shader-fullscreen");
                this.webGlrendering.resizeCanvas(document.body);
            
            }else{
                target = this.select("#shader-view");
                target.classList.remove("shader-fullscreen");
                this.webGlrendering.resizeCanvas(target);
            }
        });

        playback.addEventListener("click",() => {   
            playback.classList.toggle("fa-play");
            playback.classList.toggle("fa-pause")
            this.webGlrendering.pause();
        });

        sound.addEventListener("click",() => {
                sound.classList.toggle("fa-volume-up");
                sound.classList.toggle("fa-volume-off");
                this.webGlrendering.mute();
        });


        this.webGlrendering.onFrame = (frame) => {
            timeLine.value = parseInt(frame.ms).toString();

            timeEl.textContent = frame.min + ":" + frame.sec + ":" + (frame.ms / 10).toString().match(/^-?\d+(?:\.\d{0,-1})?/)[0];
        };

        let timeLine = this.select("#current-time") as HTMLInputElement;

        this.webGlrendering.onReady = () => {
            this.onReady();

            timeLine.setAttribute("max", "386400");

            window.setTimeout(() => {
                this.webGlrendering.start(0);
            }, 2000);

        }
        this.webGlrendering.onStop = () => {
        }
        this.webGlrendering.onStart = () => {

            let shader = this.webGlrendering.currentTimeFragment.entityShader.fragmetShader;

            let mirror = this.select("#fragment") as HTMLDivElement;

            mirror.textContent = shader;


            let lastCompile = performance.now();
            let editor = CodeMirror.fromTextArea(this.select("#fragment"),
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

            //let wrapper = document.querySelector(".wrapper");

            let helpers = new DemoishedEditorHelper(editor);

            let immediate = this.select(".immediate");
            var isCompile = false;

            editor.on("change", (cm: CodeMirror) => {
                if (isCompile) return;

                if (-(lastCompile - performance.now()) / 1000 > 0.5) {
                    isCompile = true;
                    let fs = cm.getValue();
                    let vs = this.webGlrendering.currentTimeFragment.entityShader.vertexShader;
                    let shaderErrors = this.shaderCompiler.compile(fs);
                    lastCompile = performance.now();
                    if (shaderErrors.length === 0) {
                        immediate.innerHTML = "";
                        this.webGlrendering.currentTimeFragment.entityShader.reCompile(fs);
                        if (!immediate.classList.contains("hide")) immediate.classList.add("hide");
                    }

                    let errInfo = document.querySelectorAll(".error-info");
                    for (var i = 0; i < errInfo.length; i++) {
                        errInfo[i].classList.remove("error-info");
                    }

                  
                 

                    
                    shaderErrors.length === 0 ? this.select("#btn-showconsole").classList.remove("red") : this.select("#btn-showconsole").classList.add("red");

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
                    isCompile = false;
                }
            });

        }
        this.webGlrendering.onNext = (frameInfo: any) => {
        };
        window.onerror = () => {
            this.webGlrendering.stop();
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
     DemolishedEd.getIntance();
});


