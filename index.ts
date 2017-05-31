import {
    Demolished
} from './src/demolished'
import {
    DemolishedRecorder
} from './src/demolishedRecorder';

class DemolishInstance {
    world: Demolished.World;
    recorder: DemolishedRecorder;
    timeLine: HTMLInputElement;

    pauseUi: boolean;

    onReady(): void {}


    private generereTimeLineDetails(arr:Array<any>):void{
       let parent = document.querySelector(".demolished-timeline");
       let ox:number = 0;
        arr.forEach( (ent:any,index:number) => {
            let el = document.createElement("div");



                el.classList.add("timeline-entry")
            
                let d:number = (parseInt(ent.d) / 312600);

                let w:number = 100 * (Math.round(100 * (d*1)) / 100) 

                el.style.width =  w + "%"
                el.style.left = ox + "%";
                el.style.background = '#'+(Math.random()*0xFFFFFF<<0).toString(16);

                parent.appendChild(el);
                
                ox = ox + w;
             
                 

        });
    }


    constructor() {

        this.timeLine = document.querySelector(".demolished-timeline input") as HTMLInputElement;

        this.timeLine.addEventListener("mousedown", (evt:any) =>{
         
             this.world.stop();
        });

         this.timeLine.addEventListener("mouseup", (evt:any) =>{
          
            let ms = parseInt(evt.target.value);
            let s = (ms/1000)%60
           
           
            this.world.audio.currentTime = s; 
            this.world.audio.play();

      
            this.world.start(ms);

       

        });

        this.timeLine.addEventListener("change", (evt:any) => {
        });

        let analyzerSettings = new Demolished.AudioAnalyzerSettings(8192, 0.85, -100, -30);

        let canvas = document.querySelector("#gl") as HTMLCanvasElement;


        this.world = new Demolished.World(canvas,
            "entities/timeline.json", analyzerSettings);

        this.world.onReady = () => {


            let arr = this.world.entities.map( function(a,index) {
                return {
                    d: a.stop - a.start, i: index}
            });

            this.generereTimeLineDetails(arr);


            let endTime = 352966;

           this.timeLine.setAttribute("max",endTime.toString());
       
        
            this.onReady();
        }

        this.world.onStart = () => {
            let p = document.querySelector("#record-canvas") as any;
            if (p.checked) {
                let videoStream = this.world.canvas["captureStream"](60) as MediaStream;
                let videoTrack = videoStream.getVideoTracks()[0];
                let audioTrack = this.world.getAudioTracks()[0];

                this.recorder = new DemolishedRecorder(videoTrack, audioTrack);
                this.recorder.start(1000);
            }

        }

        this.world.onFrame =(frame:any) =>{
        
            var t = frame.ts;
            document.querySelector("#time").textContent =
            ((t / 1000) / 60).toFixed(0).toString() + ":" +
             ((t/ 1000) % 60).toFixed(2).toString();

             if(!this.pauseUi)

             this.timeLine.value = frame.ts.toString();
        } 

        this.world.onStop = () => {

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

    let demolished = new DemolishInstance()

    window["demo"] = demolished;

    demolished.onReady = () => {
        launchButton.textContent = "Start";
        
        launchButton.disabled = false;

    };

    launchButton.addEventListener("click", function () {
        launchButton.classList.add("hide");
        console.log("start called", location.hash == "" ? 0 : parseInt(location.hash.substring(1)));
        demolished.world.start(location.hash == "" ? 0 : parseInt(location.hash.substring(1)));
    });

});