import { Demolished } from './src/demolished'


class DemolishInstance{

    world: Demolished.World;

    onReady(){

    }
    
    constructor(){
        this.world = new Demolished.World(
            document.querySelector("#gl") as HTMLCanvasElement
        );
   
        this.world.onReady = () =>
        {
            this.onReady();
        }
    }
 
}




document.addEventListener("DOMContentLoaded", () => {

    let launchButton: HTMLButtonElement =  
         document.querySelector("#full-screen") as HTMLButtonElement;

		
        function launchFullscreen(element) {
			if (element.requestFullscreen) { element.requestFullscreen(); } else if (element.mozRequestFullScreen)
			{ element.mozRequestFullScreen(); } else if (element.webkitRequestFullscreen) { element.webkitRequestFullscreen(); } else
				if (element.msRequestFullscreen) { element.msRequestFullscreen(); }
		}
		
         let demolished =  new DemolishInstance()

         demolished.onReady = () =>{
            console.log("ready to start...")
            launchButton.disabled = false;
            launchButton.textContent = "Press to start!"
          
         }

	
		launchButton.addEventListener("click", function () {

			//launchFullscreen(document.querySelector("#main"));
            launchButton.style.display = "none"
              demolished.world.start(0);
		});

      
});