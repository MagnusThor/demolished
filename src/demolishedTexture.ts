
class TextureBase {
    perm: Array<number>;
    constructor() {
        this.perm = this.seed(255);
    }
    normalize(a: Array<number>): Array<number> {
        let l = this.length(a);
        l != 0 ? a =  this.func(a, function(v,i) {
            return v / l;
        } ) : a = a;
        return a;         
    }
    abs(a: Array<number>): Array<number> {
        return a.map((v, i) => { return Math.abs(v) });
    }
    func(a: Array<number>, exp: Function) {
        return a.map((v, i) => exp(v,i) );
    }
    toScale(v, w) {
        var a = 0, b = w, c = -1, d = 1.;
        return (v - a) / (b - a) * (d - c) + c;
    };
    dot(a: Array<number>, b: Array<number>): number {
        return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    length(a: Array<number>): number {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]);
    }
    fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    lerp(t: number, a: number, b: number): number { return a + t * (b - a); }
    grad(hash: number, x: number, y: number, z: number): number {
        var h = hash & 15;
        var u = h < 8 ? x : y,
            v = h < 4 ? y : h == 12 || h == 14 ? x : z;
        return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
    }
    scale(n: number): number { return (1 + n) / 2; }
    seed(n: number): Array<number> {
        var p = [];
        for (var a = [], b = 0; n >= b; b++)a.push(b);
        for (b = 0; n >= b; b++) {
            var c = n * Math.random(),
                d = a[~~c]; a.splice(c, 1, a[b]); a.splice(b, 1, d);
        };
        for (var i = 0; i < n; i++) p[n + i] = p[i] = a[i];
        return p;
     }
    noise(x: number, y: number, z: number): number {
        let t = this;
        let p = this.perm;
        let X = ~~(x) & 255,



            Y = ~~(y) & 255,
            Z = ~~(z) & 255;
        x -= ~~(x);
        y -= ~~(y);
        z -= ~~(z);
        let u = t.fade(x),
            v = t.fade(y),
            w = t.fade(z);
        
            let A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z,
            B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

            
        return t.scale(t.lerp(w, t.lerp(v, t.lerp(u, t.grad(p[AA], x, y, z),
            t.grad(p[BA], x - 1, y, z)),
            t.lerp(u, t.grad(p[AB], x, y - 1, z),
                t.grad(p[BB], x - 1, y - 1, z))),
            t.lerp(v, t.lerp(u, t.grad(p[AA + 1], x, y, z - 1),
                t.grad(p[BA + 1], x - 1, y, z - 1)),
                t.lerp(u, t.grad(p[AB + 1], x, y - 1, z - 1),
                    t.grad(p[BB + 1], x - 1, y - 1, z - 1)))));
    }
}
export class DemolishedTextureGen {
    public ctx: CanvasRenderingContext2D
    private buffer: ImageData;
    private helpers: TextureBase;
    constructor(public width: number, public height: number) {
        let c = document.createElement("canvas") as HTMLCanvasElement;
        c.width = width;
        c.height = height;
        this.ctx = c.getContext("2d");
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.buffer = this.ctx.getImageData(0, 0, this.width, this.height);
        this.helpers = new TextureBase();
    }
    static createTexture(width: number, height: number, fn: Function): string {
        let instance = new DemolishedTextureGen(width, height);
        instance.render(fn);
        return instance.toBase64();
    }
    private coord = (pixel: Array<number>, x: number, y: number, w: number, h: number, fn: Function): Array<number> => {
        let r = pixel[0]; var g = pixel[1]; var b = pixel[2];
        var res = fn.apply(
            this.helpers,
            [[r, b, g], x, y, w, h]);
        return res;
    };
    private render(fn: Function) {
        let buffer = this.buffer;
        let w = this.width, h = this.height;
        for (var idx, x = 0; x < w; x++) {
            for (var y = 0; y < h; y++) {
                idx = (x + y * w) * 4;
                var r = buffer.data[idx + 0];
                var g = buffer.data[idx + 1];
                var b = buffer.data[idx + 2];
                var pixel = this.coord([r, g, b], x, y, w, h, fn);
                buffer.data[idx + 0] = pixel[0];
                buffer.data[idx + 1] = pixel[1];
                buffer.data[idx + 2] = pixel[2];
            }
        }
        this.ctx.putImageData(buffer, 0, 0);
    }
    toBase64(): string {
        return this.ctx.canvas.toDataURL("image/png");
    }
}
