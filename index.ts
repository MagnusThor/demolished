import { Demolished } from './src/demolished'


class DemolishInstance{

    world: Demolished.World;
    
    constructor(){
        this.world = new Demolished.World();

     
        
        this.world.onReady = () => {
              this.world.animate(0);
        }
    
    }

}

document.addEventListener("DOMContentLoaded", () => {

		window.addEventListener("resize", function(evt){
			resize();
		});

		function resize(){         
			var el = document.querySelector("#gl");
				el.setAttribute("height",window.innerHeight.toString());
				el.setAttribute("width",window.innerWidth.toString());


            
                

		}

		resize();
        let d = new DemolishInstance();

        


        window["demolished"] = d;
});