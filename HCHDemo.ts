import {
    Demolished
} from './src/demolished'

import  {Utils} from './src/demolishedUtils'
import { SmartArray} from './src/demolishedSmartArray';
import { RenderTarget,AudioAnalyzerSettings,Uniforms,TimeFragment,Graph,Effect } from './src/demolishedModels'

export class ExampleDemo {
  
    rendering: Demolished.Rendering;  
    onReady(): void {}
    constructor() {
     
      let canvas = document.querySelector("#gl") as HTMLCanvasElement;

        window.onerror = () =>{
            this.rendering.stop();
        }

        this.rendering = new Demolished.Rendering(canvas,"entities/graph.json");

        this.rendering.onReady = () => {
            this.onReady();
               
            window.setTimeout( () => {

            document.querySelector(".loader").classList.add("hide");
         
                this.rendering.start(0);
            },3000);
            
        }
        this.rendering.onStop = () => {
        }

        this.rendering.onStart = () => {
        }
    
        this.rendering.onNext = (frameInfo: any ) =>  {
           
        } ;

       
    }
}


document.addEventListener("DOMContentLoaded", () => {
    let demo = new ExampleDemo();

});


