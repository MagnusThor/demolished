import { Demolished } from './src/demolished'


class DemolishInstance{

    world: Demolished.World;
    
    constructor(){
        this.world = new Demolished.World(
            document.querySelector("#gl") as HTMLCanvasElement
        );
   
        window.setTimeout( () => {

             this.world.onReady = () => {
              this.world.start(0);
        }


        },2000);

       

    
    }

}

document.addEventListener("DOMContentLoaded", () => {

		
		
        window["demolished"] = new DemolishInstance()

        
});