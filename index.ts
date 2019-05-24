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
import 'codemirror/addon/display/autorefresh'
import 'codemirror/keymap/sublime';

import { Utils, ShaderCompiler, ShaderError } from './src/demolishedUtils';
import { Graph } from "./src/Graph";

import { DemolishedStreamingMusic } from "./src/demolishedSound";
import { DemoishedEditorHelper } from './src/ui/editor/demoishedEditorHelper';
import { Demolished2D } from './src/demolished2D';
import { DemolishedRecorder } from './src/demolishedRecoder';
import { Timeline } from './src/demolishedTimeline';
import { AudioWaveform } from './src/demolishedAudioWaveform';
import { SpectrumAnalyzer } from './SpectrumAnalyzer';
import { DemolishedStates } from './src/DemolishedStates';
import { ShaderEntity, IEntityTexture } from './src/demolishedEntity';


declare var LGraph: any;
declare var LiteGraph:any;
declare var LGraphCanvas: any;

export class DemolishedEd {

    static getIntance() {
        return new DemolishedEd();
    }
    demoTimeline: Timeline; // todo: would be DemolishedTimeLine?
    engine: Demolished.Rendering;
    music: DemolishedStreamingMusic;
    helpers: DemoishedEditorHelper;
    shaderCompiler: ShaderCompiler
    isFullscreen:boolean = false;
    
    states: DemolishedStates;
    
    onReady(): void {
        Utils.$(".loader").classList.add("hide");
    }
    static showJSON(data:any,t:HTMLElement | Element){
        t.textContent = JSON.stringify(data);
    }
    private spectrum: SpectrumAnalyzer;

    public recorder: DemolishedRecorder;

    private editors:Array<CodeMirror>;

    private timeLime: AudioWaveform;

    segmentChange(...args:any) {
        console.log("...",args);
    }


    setActiveShader(shader:ShaderEntity) {  
            
        let fragmentShaderSource = shader.fragmentShader;
        let vertexShaderSource = shader.vertexShader;

        this.engine.shaderEntity = shader;

        this.editors[1].getDoc().setValue(fragmentShaderSource);
        this.editors[0].getDoc().setValue(vertexShaderSource);
    


    }

    
    
    constructor() {

        var graph = new LGraph();

        var canvas = new LGraphCanvas("#lgraph", graph);
   

        this.states = new DemolishedStates();


        this.editors = new Array<CodeMirror>();
       
        let Render2D = new Demolished2D(Utils.$("#canvas-spectrum") as HTMLCanvasElement);
       
        this.spectrum = new SpectrumAnalyzer(Render2D.ctx);
        Render2D.addEntity(this.spectrum);
        Render2D.start(0);

        this.shaderCompiler = new ShaderCompiler();
        this.music = new DemolishedStreamingMusic();

        this.engine = new Demolished.Rendering(Utils.$("#webgl") as HTMLCanvasElement,
            Utils.$("#shader-view"),
            "entities/graph.json", this.music);

        let playback = Utils.$("#toogle-playback");

        let sound = Utils.$("#toggle-sound");
        let fullscreen = Utils.$("#btn-fullscreen");
        let immediate = Utils.$(".immediate");
        let resetTimers = Utils.$("#reset-clocks");

        let shaderResolution = Utils.$("#shader-resolution") as HTMLInputElement;
        let shaderWin = Utils.$("#shader-win");
        let record = Utils.$("#btn-record");

        record.addEventListener("click", () => {

            if (!this.recorder) {           
                this.engine.resetClock(0);
                immediate.classList.remove("hide");
                let videoTrack = this.engine.canvas["captureStream"](60);
                let audioTracks = this.engine.audio.getTracks();
                this.recorder = new DemolishedRecorder(videoTrack.getTracks()[0],audioTracks[0]);

                this.recorder.start(60);

                let p = Utils.el("p", "Recording"); 
                
                immediate.appendChild(p);

            } else {
                this.recorder.stop();
                let filename = Math.random().toString(36).substring(2) + ".webm";
                let p = Utils.el("p");
                let a = Utils.el("a", "Download recording", { download: filename, href: this.recorder.toBlob() });
                p.appendChild(a);
                immediate.appendChild(p);
            }
        });


        Utils.$$("*[data-close]").forEach ( (n:Element) => {

                n.addEventListener("click",() => n.parentElement.classList.toggle("hide"));

        });

         Utils.$("#show-shaders").addEventListener("click",(evt) => {
                Utils.$("#shader-list").classList.toggle("hide");
         });

        let tabButtons = Utils.$$(".tab-caption");
        let tabs = Utils.$$(".tab")

        tabButtons.forEach((el: HTMLElement) => {
            el.addEventListener("click", (evt: Event) => {

                tabs.forEach((b: HTMLElement) => {
                    b.classList.add("hide");
                });

                tabButtons.forEach((b: HTMLElement) => {
                    b.classList.remove("tab-active");
                });

                let src = evt.srcElement as HTMLElement;
                src.classList.add("tab-active");
                Utils.$("#" + src.dataset.target).classList.remove("hide");

                // RefreshEditors , due to CodeMirror issue?
                this.editors.forEach( (cm:CodeMirror,i:number) => {
                       cm.refresh();
                });



            });
        });

        shaderWin.addEventListener("dragend", (evt: DragEvent) => {
            let win = evt.target as HTMLElement;
            win.style.left = (evt.clientX).toString() + "px";
            win.style.top = evt.clientY.toString() + "px";
        });

        resetTimers.addEventListener("click", () => {
                this.engine.resetClock(0);
                 
        });

        Utils.$("#btn-showconsole").addEventListener("click", () => {
            Utils.$(".immediate").classList.toggle("hide");
        });
        fullscreen.addEventListener("click", () => {
            let view = Utils.$("#webgl");
            view.requestFullscreen();

        });
        shaderResolution.addEventListener("change", () => {
            this.engine.resizeCanvas(Utils.$("#shader-view"),
                parseInt(shaderResolution.value));
        });

    
        document.addEventListener("fullscreenchange", (e:any) => {
            let target = e.target;
            if (!this.isFullscreen) {
                target.classList.add("shader-fullscreen");
                this.engine.resizeCanvas(document.body);
            } else {
                target = Utils.$("#shader-view");
                target.classList.remove("shader-fullscreen");
                this.engine.resizeCanvas(target);
            }
            this.isFullscreen = !this.isFullscreen;
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
            this.spectrum.frequencData = this.music.getFrequenceData();
            this.timeLime.updateAudioPosition();
         //   timeEl.textContent = frame.min + ":" + frame.sec + ":" + (frame.ms / 10).toString().match(/^-?\d+(?:\.\d{0,-1})?/)[0];     
        
        
        };

      


        this.engine.onReady = () => {




            this.timeLime = new AudioWaveform(this.engine.audio.audioBuffer,this.engine.audio.getAudioEl())
            this.demoTimeline = new Timeline("#current-time",this.engine.graph.duration);

            /*
                PoC using lithegraph.js as Graph util.  */
            let randomPos = () => {
                return Math.floor((Math.random() * 400) +1);
            }
            /**
             * Visualize a ShaderEntity and its properties, and relations un the Graph.
             *
             * @param {ShaderEntity} shader
             */
            let shaderNode = (shader:ShaderEntity) => {
                const ndShader = LiteGraph.createNode("basic/const");
                ndShader.title = shader.name;
                ndShader.pos = [randomPos(),randomPos()];
                ndShader.setValue(0.0);
                    graph.add(ndShader);
                    shader.textures.forEach( (texture:IEntityTexture)  => {
                        const ndTexture = LiteGraph.createNode("basic/watch");
                        ndTexture.title = texture.name;
                        ndTexture.pos = [randomPos(),randomPos()];  
                        graph.add(ndTexture);
                        ndShader.connect(0, ndTexture, 0 );       
                    });              
            }


            this.engine.entitiesCache.forEach ((shader:ShaderEntity) => {                
                
                shaderNode(shader);  

                const listEl = Utils.el("li", shader.name);


                listEl.addEventListener("click", () => {
                    this.setActiveShader(shader);
                });

                Utils.$("#shader-list ul").appendChild(listEl);


            });

            // 
    
            graph.start()

            this.onReady();
            
            window.setTimeout(() => {
                this.engine.start(0);
                console.log("starting after 2000ms")
            }, 2000);

        }
        this.engine.onNext = (f:any) => {
            console.log("onNext->",f)
        };

        this.engine.onStop = () => {
        }
        

      

        this.engine.onStart = () => {


            let fragmentEditor = CodeMirror.fromTextArea(Utils.$("#fragment"),
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
                    autofocus: false,
                    autorefresh:true
                }
            );

           this.helpers = new DemoishedEditorHelper(fragmentEditor);

            this.shaderCompiler.onError = (shaderErrors: Array<ShaderError>) => {
                console.log("onerror",shaderErrors);
                shaderErrors.forEach((err: ShaderError) => {
                    let errNode = Utils.el("abbr");
                    errNode.classList.add("error-info");
                    errNode.title = err.error;

                    fragmentEditor.setGutterMarker(err.line - 1, "note-gutter", errNode);

                    let p = Utils.el("p");
                    let m = Utils.el("mark", err.line.toString());
                    let s = Utils.el("span", err.error);

                    p.appendChild(m);
                    p.appendChild(s);

                    immediate.appendChild(p);

                });
            };
      
            this.shaderCompiler.onSuccess = (source: string) => {
                let shaderErrors = Utils.$$(".error-info");
                shaderErrors.forEach((el: Element) => {
                    el.classList.remove("error-info");
                });
                this.engine.shaderEntity.setFragment(source);

            }

            fragmentEditor.on("change", (cm: CodeMirror) => {
                let source = cm.getValue();
                if (source.length == 0 && !this.shaderCompiler.canCompile()) return;
                this.shaderCompiler.compile(
                    
                    source,this.engine.shared);
                this.states.set("fragmentChange",true);
            });



            let vertexEditor = CodeMirror.fromTextArea(Utils.$("#vertex"),{
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
                autorefresh:true
            });
        

       
            vertexEditor.on("change",(cm:CodeMirror) =>{
                    let source = cm.getValue();                
                    console.log("vertext changed, set and compile vertex",source);
            });
            
            
            this.editors.push(vertexEditor,fragmentEditor);

            this.setActiveShader(this.engine.shaderEntity);
      
        

            this.states.add("fragmentChange").listen("fragmentChange", (a,b) => {
                   let el = Utils.$("#frag i");
                   a ?  el.classList.add("hide") : el.classList.remove("hide");
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
    window["_demo"] = DemolishedEd.getIntance();
});


