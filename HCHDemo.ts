import {
    Demolished
} from './src/demolished'

import { Utils } from './src/demolishedUtils'
import { SmartArray } from './src/demolishedSmartArray';
import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect } from './src/demolishedModels'

import { DemolishedCanvas, BaseEntity2D } from './src/demolishedCanvas'

import { Scroller2D } from "./entities/2d/scroller/scroller";

export class ExampleDemo {

    webGlrendering: Demolished.Rendering;
    canvasRendering: DemolishedCanvas;

    onReady(): void { }
    constructor() {

        let webGlCanvas = document.querySelector("#gl") as HTMLCanvasElement;


        let canavs2d = document.querySelector("#canvas2d") as HTMLCanvasElement;

        this.canvasRendering = new DemolishedCanvas(canavs2d);
        
        this.canvasRendering.addEntity(
            new Scroller2D(this.canvasRendering.ctx, "This is a scroller.... old and gold..")
            );

        this.webGlrendering = new Demolished.Rendering(webGlCanvas, "entities/graph.json");

        this.webGlrendering.onReady = () => {
            this.onReady();
            window.setTimeout(() => {
                document.querySelector(".loader").classList.add("hide");
                this.webGlrendering.start(0);
                this.canvasRendering.start(0);
            }, 3000);
        }
        this.webGlrendering.onStop = () => {
        }

        this.webGlrendering.onStart = () => {
        }

        this.webGlrendering.onNext = (frameInfo: any) => {
        };

        window.onerror = () => {
            this.webGlrendering.stop();
        }

    }
}


document.addEventListener("DOMContentLoaded", () => {
    let demo = new ExampleDemo();

});


