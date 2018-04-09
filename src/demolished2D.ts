export class BaseEntity2D {
    width: number;
    height:number;
    public constructor(public name:string,public ctx:CanvasRenderingContext2D){
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
    }
    update(t:number){
    }

    getPixels():ImageData{
        return this.ctx.getImageData(0,0,this.width,this.height);
    }
    putPixels(){
        throw "not implemented";
    }

}
export interface IEntity2D{
    update:(time:number) => void
    start:number;
    stop:number;
    active:boolean;
}

export class Demolished2D{
    public ctx:CanvasRenderingContext2D
    private entities: Array<BaseEntity2D>;
    constructor(public canvas:HTMLCanvasElement,public w?:number,h?:number){
        this.entities  = new Array<BaseEntity2D>();
        this.ctx = canvas.getContext("2d");
        this.animationStartTime  = 0;
        if( !w && !h)
            this.resizeCanvas();
    }

    clear(){
        this.ctx.clearRect(0,0,this.ctx.canvas.width,this.ctx.canvas.height);
    }

    animationStartTime:number;
    animationFrameId: number;

    private animate(time:number){
           let animationTime = time - this.animationStartTime;
            this.animationFrameId = requestAnimationFrame((_time: number) => {
                this.animate(_time);
            });
            this.renderEntities(time);
    }

    addEntity(ent:BaseEntity2D){
        this.entities.push(ent);
    }

    private resizeCanvas(){
        
            let width = window.innerWidth / 2
            let height = window.innerHeight / 2;
            this.canvas.width = width;
            this.canvas.height = height;
            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';
    }

    private renderEntities(time:number){
        this.clear();
        this.entities.forEach( (ent:BaseEntity2D) => {
                ent.update(time)
        });

    }

    start(startTime){
        this.animate(startTime);
    }

}