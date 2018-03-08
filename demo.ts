import {
    Demolished
} from './src/demolished'


import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect, AudioSettings } from './src/demolishedModels';
import {  DemolishedSIDMusic } from "./src/demolishedSound";
import { DemoishedProperty, DemolishedDialogBuilder } from './src/demolishedProperties';



export class Demo {

    webGlrendering: Demolished.Rendering;
    onReady(): void { }

    static getIntance(){
        return new this();
    }

    constructor() {
     
        let webGlCanvas = document.querySelector("#webgl") as HTMLCanvasElement;

        let music = new DemolishedSIDMusic();

        this.webGlrendering = new DemoishedProperty<Demolished.Rendering>(new Demolished.Rendering(webGlCanvas,
            document.querySelector("foo"),
            "entities/demo.json", music)).getObserver();

        // this.webGlrendering = new Demolished.Rendering(webGlCanvas,
        //     "entities/demo.json", music);

        this.webGlrendering.onFrame = (frame) => {
        };

        this.webGlrendering.onReady = () => {

            DemolishedDialogBuilder.render(this.webGlrendering,document.querySelector("#dlg > .prop-content"));

            
            this.onReady();
            window.setTimeout(() => {
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


