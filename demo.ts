import {
    Demolished
} from './src/demolished'

import { DemolishedSonant } from './src/DemolishedSonant';

export class Demo {

    webGlrendering: Demolished.Rendering;
    onReady(): void { }

    static getIntance(){
        return new this();
    }

    constructor() {
     
        let webGlCanvas = document.querySelector("#webgl") as HTMLCanvasElement;

        let music = new DemolishedSonant(window["song"]);

        for (var t = 0; t < 8; t++) music.generate(t);;
       
        this.webGlrendering = new Demolished.Rendering(webGlCanvas,
            document.querySelector("#shader-view"),
            "entities/graph.json", music);


        this.webGlrendering.onFrame = (frame) => {
        };

        this.webGlrendering.onReady = () => {
            this.onReady();
            window.setTimeout(() => {
                document.querySelector(".loader").classList.add("hide");
                this.webGlrendering.resizeCanvas(document.querySelector("#shader-view"),2);
                this.webGlrendering.start(0);
            }, 2000);

        }
        this.webGlrendering.onStop = () => {
        }
        this.webGlrendering.onStart = () => {
        };
        this.webGlrendering.onNext = (frameInfo: any) => {
        };
        window.onerror = () => {
            this.webGlrendering.stop();
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
        Demo.getIntance();
});


