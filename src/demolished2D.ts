

export class BaseEntity2D {
    width: number;
    height: number;
    public constructor(public name: string, public ctx: CanvasRenderingContext2D) {
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
    }
    update(t: number):void {
    }
    getPixels(): ImageData {
        return this.ctx.getImageData(0, 0, this.width, this.height);
    }
    putPixels(data:ImageData,x:number,y:number):BaseEntity2D {
            this.ctx.putImageData(data,x,y);
            return this;
    }
    setPixel(r:number,g:number,b:number,x:number,y:number):BaseEntity2D{
        let data = new Uint8ClampedArray([r,g,b]);
        this.ctx.putImageData(new ImageData(data,1,1),x,y);
        return this;
    }
}
export class Point3D {
    constructor(public x: number, public y: number, public z: number) {
    }
    rotateX(angle:number):Point3D{
        var rad, cosa, sina, y, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        y = this.y * cosa - this.z * sina;
        z = this.y * sina + this.z * cosa;
        return new Point3D(this.x, y, z);
    }
    rotateY(angle:number):Point3D {
        var rad, cosa, sina, x, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        z = this.z * cosa - this.x * sina;
        x = this.z * sina + this.x * cosa;
        return new Point3D(x, this.y, z);
    }
    rotateZ(angle:number):Point3D {
        var rad, cosa, sina, x, y;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        x = this.x * cosa - this.y * sina;
        y = this.x * sina + this.y * cosa;
        return new Point3D(x, y, this.z);
    }

    length(): number {
        var length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        return length;
    }
    scale(scale: number):void {
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
    }

    normalize(): boolean {
        let lengthval = this.length();
        if (lengthval != 0) {
            this.x /= lengthval;
            this.y /= lengthval;
            this.z /= lengthval;
            return true;
        } else {
            return false;
        }
    }

    angle(bvector:Point3D): number {
        var anorm = new Point3D(this.x, this.y, this.z);
        anorm.normalize();
        var bnorm = new Point3D(bvector.x, bvector.y, bvector.z);
        bnorm.normalize();
        var dotval = anorm.dot(bnorm);
        return Math.acos(dotval);
    }

    cross(vectorB:Point3D) {
        var tempvec = new Point3D(this.x, this.y, this.z);
        tempvec.x = (this.y * vectorB.z) - (this.z * vectorB.y);
        tempvec.y = (this.z * vectorB.x) - (this.x * vectorB.z);
        tempvec.z = (this.x * vectorB.y) - (this.y * vectorB.x);
        this.x = tempvec.x;
        this.y = tempvec.y;
        this.z = tempvec.z;
        //this.w = tempvec.w;
    }
    dot(vectorB:Point3D) {
        return this.x * vectorB.x + this.y * vectorB.y + this.z * vectorB.z;
    }

    project(width:number, height:number, fov:number, distance:number) {
        var factor, x, y;
        factor = fov / (distance + this.z);
        x = this.x * factor + width / 2;
        y = this.y * factor + height / 2;
        return new Point3D(x, y, this.z);
    }
}

export interface IEntity2D {
    update: (time: number) => void
    start: number;
    stop: number;
    active: boolean;
}

export class Demolished2D {
    public ctx: CanvasRenderingContext2D
    private entities: Array<BaseEntity2D>;
    constructor(public canvas: HTMLCanvasElement, public w?: number, h?: number) {
        this.entities = new Array<BaseEntity2D>();
        this.ctx = canvas.getContext("2d");
        this.animationStartTime = 0;
        if (!w && !h)
            this.resizeCanvas();
    }

    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }

    animationStartTime: number;
    animationFrameId: number;

    private animate(time: number) {
        let animationTime = time - this.animationStartTime;
        this.animationFrameId = requestAnimationFrame((_time: number) => {
            this.animate(_time);
        });
        this.renderEntities(time);
    }

    addEntity(ent: BaseEntity2D) {
        this.entities.push(ent);
    }

    private resizeCanvas() {

        let width = window.innerWidth / 2
        let height = window.innerHeight / 2;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    }

    private renderEntities(time: number) {
        this.clear();
        this.entities.forEach((ent: BaseEntity2D) => {
            ent.update(time)
        });

    }

    start(startTime) {
        this.animate(startTime);
    }

}