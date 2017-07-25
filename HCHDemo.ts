import {
    Demolished
} from './src/demolished'

import { Utils } from './src/demolishedUtils'
import { SmartArray } from './src/demolishedSmartArray';
import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect } from './src/demolishedModels'

import { DemolishedCanvas, BaseEntity2D } from './src/demolishedCanvas'

/* Simple Canvas effects ( such as scrollers, faders etc  ) */

import { Scroller2D } from "./entities/2d/scroller/scroller";
import { DemolishedTrans } from "./src/demolihedTrans";

const scrollText = "This is fucking it, we love and support sami terrorism but hate everyting else, maybe we can save an artic fox just because it is evil. Barbie is fucking wasted on norrlaendskt haembrant and russian krokodil.  Speedfisters is going to die by our knife. Norrland is filling our souls with the deepest insanity and hate towards everything that can die. Spraeng bort allt soeder om Dalaelven! Djaevla mesar!   Fuck this shit! It's time to go out in the northern wilderness and become one with all the fucking insane bears and wolves. All that will be left is bloody corpses, ready for nature to fuck with all it's satanic evil.  btw, fuck a raindeer.  spitvaelling and blodkams!        ";

export class HCHDemo {

    webGlrendering: Demolished.Rendering;
    canvasRendering: DemolishedCanvas;
    transitions: DemolishedTrans;

    onReady(): void { }


    

    constructor() {

        this.transitions = new DemolishedTrans("#trans",
       { timeLine: [
           {
           
                    name: "intro",
                    classes: ["elk",],
                    start: 12500
                },
                {
                    name: "skog",
                    classes: ["elk"],
                    start: 28500
                   
                },
                {
                    name: "blod",
                    classes: ["elk"],
                    start: 42500
                },
                 {
                    name: "ren",
                    classes: ["elk"],
                    start: 55750
                },
                {
                    name: "hund",
                    classes: ["elk"],
                    start: 87500
                }
            ]
        }

        
        );

        let webGlCanvas = document.querySelector("#webgl") as HTMLCanvasElement;

        let canavs2d = document.querySelector("#simpleCanvas") as HTMLCanvasElement;

        this.canvasRendering = new DemolishedCanvas(canavs2d);



        this.canvasRendering.addEntity(
            new Scroller2D(this.canvasRendering.ctx, scrollText));            

        this.webGlrendering = new Demolished.Rendering(webGlCanvas, "entities/graph.json",this.canvasRendering);

        this.webGlrendering.onReady = () => {
            this.onReady();
          //  document.querySelector(".loader").classList.add("hide");
            window.setTimeout(() => {
                document.querySelector(".loader").classList.add("hide");
                
                this.webGlrendering.start(0);
                window.setTimeout(  () => {
                        this.canvasRendering.start(0);
                },105 * 1000);
                
                
                this.transitions.start(0);

            }, 2000);
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

        document.addEventListener("keyup", (e:KeyboardEvent) => {
                if(e.keyCode === 13)
                console.log(this.webGlrendering.uniforms);
        });
     

    }
}


document.addEventListener("DOMContentLoaded", () => {
    let demo = new HCHDemo();

});


