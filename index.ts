import { Demolished } from './src/demolished'


class DemolishInstance{

    world: Demolished.World;
    
    constructor(){
        this.world = new Demolished.World();

        
     

      // this.world.animate();
    }

}

document.addEventListener("DOMContentLoaded", () => {
    let d = new DemolishInstance();
     window["food"] = d;
});