import { Demolished2D, BaseEntity2D, IEntity2D } from './src/demolished2D';
import { Utils } from './src/demolishedUtils';
import { DemolishedConfig } from './src/demolishedConfig';
import { TimeFragment } from './src/demolishedModels';

export class TextEffect extends BaseEntity2D implements IEntity2D {
    dx:number;
    dy:number;
    active: boolean = true;
    start:0;
    stop:0;
    constructor(name:string,ctx:CanvasRenderingContext2D,public text:string,
        public x:number,public y:number
        ,public font:string){
        super(name,ctx);
    
    }       
    update (time: number) {   
        let ctx = this.ctx;
        ctx.save();

        ctx.fillStyle = "#fff";
        ctx.font =  this.font;
        let dx = this.width / 2;
        let dy = this.height / 2;
       
        ctx.strokeStyle ="#fff";
        ctx.lineWidth  = 10;
        var sx = Math.random()*2;
        var sy = Math.random()*2;
        ctx.translate(sx, sy);

        ctx.strokeRect(20,20,512-40,512-40);
        ctx.stroke();
        ctx.fillText(this.text, this.x, this.y,this.width-120);

        ctx.restore();
   };

}

export class Lab2d{

    static getInstance(el:HTMLCanvasElement):Lab2d{
        return new this(el);
    }

    constructor(el:HTMLCanvasElement){
        let Render2D = new Demolished2D(el,512,512);

        Render2D.addEntity(new TextEffect("textBlock",Render2D.ctx,"CODE",60,240,"128px 'Arial'"));
        Render2D.addEntity(new TextEffect("textBlock",Render2D.ctx,"FOO BAR",80,380,"bold 128px 'Arial'"));
        Render2D.start(0);

        let store = new DemolishedConfig();

        store.loadStore();

            store.save("foo",1);
            store.save("bar","Hello World");
            store.save<TimeFragment>("timeFragment",new TimeFragment("shader",0,2000,[100,200]));

            let tf = store.load<TimeFragment>("timeFragment");

        store.updateStore();





    }

}



document.addEventListener("DOMContentLoaded",() =>{
    Lab2d.getInstance(document.querySelector("#foo"));
});