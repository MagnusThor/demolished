import { Demolished } from './src/demolished'


class DemolishInstance{

    world: Demolished.World;
    
    constructor(){
        this.world = new Demolished.World();

        
        this.world.addEntity("plasma");

       this.world.animate();
    }

}

document.addEventListener("DOMContentLoaded", () => {
    let d = new DemolishInstance();
    console.log("d",d)
});