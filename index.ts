import {
    Demolished
} from './src/demolished'
import {
    DemolishedRecorder
} from './src/demolishedRecorder';


import  {Utils} from './src/demolishedUtils'
import { SmartArray} from './src/demolishedSmartArray';
import { RenderTarget,AudioAnalyzerSettings,Uniforms,TimeFragment,Graph,Effect } from './src/demolishedModels'


export class DemolishedSequencer {

    totalDuration:number

    rendering: Demolished.Rendering;
    recorder: DemolishedRecorder;
    timeLine: HTMLInputElement;

    pauseUi: boolean;
    pausedAt:number;
    startedAt: number;

    onReady(): void {}

    private getTimeLineDetails(arr:Array<any>):void{
       let parent = document.querySelector(".demolished-timeline");
       let ox:number = 0;
        arr.forEach( (ent:any,index:number) => {
            let el = document.createElement("div");
                el.classList.add("timeline-entry")            
                let d:number = (parseInt(ent.duration) / this.totalDuration);
                let w:number = 100 * (Math.round(100 * (d*1)) / 100) 
                el.style.width =  w + "%"
                el.style.left = ox + "%";
                el.style.background = '#'+(Math.random()*0xFFFFFF<<0).toString(16);

               
                let callout = document.createElement("div");
                callout.classList.add("timeline-callout","hide");
                callout.textContent =  ent.name;
                
                el.addEventListener("mouseenter", () => {
                  
                  
                callout.classList.remove("hide");
                });

                 el.addEventListener("mouseleave", () => {
                    callout.classList.add("hide");
                });

               
                el.appendChild(callout);



                parent.appendChild(el);                

                ox +=  w;
        });
    }


    constructor() {

        document.addEventListener("keydown", (evt:KeyboardEvent) =>{
           
            console.log("time & freq ",this.renderig.parameters.time,
            this.rendering.parameters.freq
            );
        });

        this.totalDuration = 249600;

        this.timeLine = document.querySelector(".demolished-timeline input") as HTMLInputElement;

        this.timeLine.addEventListener("mousedown", (evt:any) =>{         
             this.rendering.stop();
        });

         this.timeLine.addEventListener("mouseup", (evt:any) =>{
            let ms = parseInt(evt.target.value);
            let s = (ms/1000)%60
            this.rendering.audio.pause();
            this.rendering.start(ms);
        });

        this.timeLine.addEventListener("change", (evt:any) => {
        });

    
        let canvas = document.querySelector("#gl") as HTMLCanvasElement;

        window.onerror = () =>{
            this.rendering.stop();
        }

        this.rendering = new Demolished.Rendering(canvas,
            "entities/graph.json");

        this.rendering.onReady = () => {

            let details = this.rendering.timeFragments.map( function(a,index) {
                return {
                    duration: a.stop - a.start, index: index,description: "foo",name:a.entity}
            });

           this.getTimeLineDetails(details);

           this.timeLine.setAttribute("max",this.totalDuration.toString());
        
            this.onReady();
        }

        this.rendering.onStart = () => {
            let p = document.querySelector("#record-canvas") as any;
            if (p.checked) {
               // let videoStream = this.world.canvas["captureStream"](60) as MediaStream;
                // let videoTrack = videoStream.getVideoTracks()[0];
                // let audioTrack = this.world.getAudioTracks()[0];
                // this.recorder = new DemolishedRecorder(videoTrack, audioTrack);
                // this.recorder.start(100);
                console.error("needs to be fixed");
            }
        }
        this.rendering.onFrame =(frame:any) =>{
            var t = frame.ts;
            document.querySelector("#time").textContent =
            ((t / 1000) / 60).toFixed(0).toString() + ":" +
             ((t/ 1000) % 60).toFixed(2).toString();
             if(!this.pauseUi)

             this.timeLine.value = frame.ts.toString();
        } 

        this.rendering.onStop = () => {
            if (this.recorder) {
                let recorderNode = document.querySelector("#recording");

                this.recorder.stop();

                let blob = new Blob(this.recorder.data, {
                    type: 'video/webm'
                });
                let url = window.URL.createObjectURL(blob);
                let downloadlink = document.createElement('a');
                downloadlink.textContent = "download recording"
                downloadlink.href = url;

                recorderNode.classList.remove("hide");
                recorderNode.appendChild(downloadlink);

            }

        }


    }
}

document.addEventListener("DOMContentLoaded", () => {

    let launchButton: HTMLButtonElement =

        document.querySelector("#full-screen") as HTMLButtonElement;

    function launchFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else
        if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    let demolished = new DemolishedSequencer()

    window["demo"] = demolished;

    demolished.onReady = () => {
        launchButton.textContent = "Start";
        
        launchButton.disabled = false;

    };

    launchButton.addEventListener("click", function () {
        launchButton.classList.add("hide");
        demolished.rendering.start(location.hash == "" ? 0 : parseInt(location.hash.substring(1)));
    });

});