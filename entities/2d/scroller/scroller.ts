import { BaseEntity2D, IEntity2D } from "../../../src/demolishedCanvas";

export class Scroller2D extends BaseEntity2D implements IEntity2D {

  

    active:boolean;
    start: 0;
    stop: 10000;

    font: string;
    textWidth: number = 0;
    y: number = 10;
    x: number = 0;

    constructor(ctx: CanvasRenderingContext2D, public text: string) {
        super("scroller", ctx);
        this.font = "12px Arial";
        this.x = ctx.canvas.width;
        ctx.fillStyle = "#FFFFFF";
       
        this.textWidth = ctx.measureText(this.text).width;
        this.active = true;
        this.y = ctx.canvas.height - 48;
    }
    update(time) {
        if (this.textWidth + this.x < 0) {
            this.x = this.ctx.canvas.width;
        }
        else {
            this.x--;
        }
        this.ctx.font = this.font;
        this.ctx.fillText(this.text, this.x, this.y);
    }
}