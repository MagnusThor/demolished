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


import { Utils,ShaderCompiler,ShaderError } from './src/demolishedUtils'
import { SmartArray } from './src/demolishedSmartArray';
import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect } from './src/demolishedModels'

import { Scroller2D } from "./entities/2d/scroller/scroller";
import { DemolishedStreamingMusic, DemolishedSIDMusic } from "./src/demolishedSound";


export class DemoEd {

    webGlrendering: Demolished.Rendering;


    compiler: ShaderCompiler;

    onReady(): void { }

    constructor() {


        this.compiler = new ShaderCompiler();

        let webGlCanvas = document.querySelector("#webgl") as HTMLCanvasElement;

        let music = new DemolishedStreamingMusic();

        this.webGlrendering = new Demolished.Rendering(webGlCanvas,
         "entities/graph.json",music);

         var timeEl = document.querySelector(".time");

        timeEl.addEventListener("click", () =>
        {
               this.webGlrendering.uniforms.time = 0;
               this.webGlrendering.resetClock(0);
        });

        this.webGlrendering.onFrame = (frame) =>{
            timeLine.value = parseInt(frame.ms).toString();
            
            timeEl.textContent = frame.min + ":" + frame.sec + ":" + (frame.ms / 10).toString().match(/^-?\d+(?:\.\d{0,-1})?/)[0];
        };

        let timeLine = document.querySelector("#current-time") as HTMLInputElement;

        this.webGlrendering.onReady = () => {
            this.onReady();
   
            timeLine.setAttribute("max","386400");
         
            window.setTimeout( () => {
                this.webGlrendering.start(0);
            },2000);        
          
        }
        this.webGlrendering.onStop = () => {
        }
        this.webGlrendering.onStart = () => {

            let shader = this.webGlrendering.currentTimeFragment.entityShader.fragmetShader;

            let mirror = document.querySelector("#fragment") as HTMLDivElement;

            mirror.textContent = shader;


            let lastCompile = performance.now();
            let editor = CodeMirror.fromTextArea(document.querySelector("#fragment"),
            {
                gutters: ["note-gutter", "CodeMirror-linenumbers"],
                viewportMargin: Infinity,
                lineNumbers:true,
                matchBrackets: true,
                mode: 'x-shader/x-fragment',
                keyMap: 'sublime',
                autoCloseBrackets: true,
                showCursorWhenSelecting: true,
                theme:"monokai",
                indentUnit: 4,
                lineWrapping: true,
                autofocus: true
            }
            );


            var isCompile = false;

            editor.on("change", (cm:CodeMirror) => {
                if(isCompile) return;
                
                console.clear();
                console.log(-(lastCompile - performance.now())  / 1000 , -(lastCompile - performance.now())  / 1000  > 5.);
                if( -(lastCompile - performance.now())  / 1000  > 0.5){

                    isCompile = true;
                    let fs = cm.getValue();
                    let vs = this.webGlrendering.currentTimeFragment.entityShader.vertexShader;

                    let compleErrors = this.compiler.compile(fs);

                    lastCompile = performance.now();


                    if(compleErrors.length === 0){
                        console.log("set new fs");
                        this.webGlrendering.currentTimeFragment.entityShader.reCompile(
                            fs
                        );
                    }
                   
                    document.querySelectorAll(".error-info").forEach( e => {
                        e.classList.remove("error-info");
                     });

                    compleErrors.forEach ( (err:ShaderError) => {

                        let errNode = document.createElement("abbr");

                        errNode.classList.add("error-info");
                        errNode.title = err.error;

    

                  //      editor.addLineClass(err.line-1, "background", "highlighted-line");

                        editor.setGutterMarker(err.line -1, "note-gutter", errNode);
                     
                      //  editor.setMarker(err.line - 1, '<abbr title="' + err.error + '">' + err.line + '</abbr>', "errorMarker");
                        
                       // editor.setLineClass(err.line, "errorLine");
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
    let demo = new DemoEd();


    window["demoEd"] = demo;

    // // output shader code - > #define triggerX time:float
    // let tmCount = 0;
    // document.addEventListener("keyup", (e:any) => {
       
    //     if(e.keyCode == 84){

       
    //     let tm = demo.webGlrendering.uniforms.time / 1000.;
    //     console.log("#define trigger%s %f",tmCount,tm.toFixed(2));
    //     tmCount++
    //     }else if(e.keyCode ==83){
    //         demo.webGlrendering.uniforms.time = 0;
    //         demo.webGlrendering.resetClock(0);
    //     }
    // });

   

});


