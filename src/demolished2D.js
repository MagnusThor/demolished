"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BaseEntity2D {
    constructor(name, ctx) {
        this.name = name;
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
    }
    update(t) {
    }
    getPixels() {
        return this.ctx.getImageData(0, 0, this.width, this.height);
    }
    putPixels(data, x, y) {
        this.ctx.putImageData(data, x, y);
        return this;
    }
    setPixel(r, g, b, x, y) {
        let data = new Uint8ClampedArray([r, g, b]);
        this.ctx.putImageData(new ImageData(data, 1, 1), x, y);
        return this;
    }
}
exports.BaseEntity2D = BaseEntity2D;
class Point3D {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    rotateX(angle) {
        var rad, cosa, sina, y, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        y = this.y * cosa - this.z * sina;
        z = this.y * sina + this.z * cosa;
        return new Point3D(this.x, y, z);
    }
    rotateY(angle) {
        var rad, cosa, sina, x, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        z = this.z * cosa - this.x * sina;
        x = this.z * sina + this.x * cosa;
        return new Point3D(x, this.y, z);
    }
    rotateZ(angle) {
        var rad, cosa, sina, x, y;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        x = this.x * cosa - this.y * sina;
        y = this.x * sina + this.y * cosa;
        return new Point3D(x, y, this.z);
    }
    length() {
        var length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        return length;
    }
    scale(scale) {
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
    }
    normalize() {
        let lengthval = this.length();
        if (lengthval != 0) {
            this.x /= lengthval;
            this.y /= lengthval;
            this.z /= lengthval;
            return true;
        }
        else {
            return false;
        }
    }
    angle(bvector) {
        var anorm = new Point3D(this.x, this.y, this.z);
        anorm.normalize();
        var bnorm = new Point3D(bvector.x, bvector.y, bvector.z);
        bnorm.normalize();
        var dotval = anorm.dot(bnorm);
        return Math.acos(dotval);
    }
    cross(vectorB) {
        var tempvec = new Point3D(this.x, this.y, this.z);
        tempvec.x = (this.y * vectorB.z) - (this.z * vectorB.y);
        tempvec.y = (this.z * vectorB.x) - (this.x * vectorB.z);
        tempvec.z = (this.x * vectorB.y) - (this.y * vectorB.x);
        this.x = tempvec.x;
        this.y = tempvec.y;
        this.z = tempvec.z;
    }
    dot(vectorB) {
        return this.x * vectorB.x + this.y * vectorB.y + this.z * vectorB.z;
    }
    project(width, height, fov, distance) {
        var factor, x, y;
        factor = fov / (distance + this.z);
        x = this.x * factor + width / 2;
        y = this.y * factor + height / 2;
        return new Point3D(x, y, this.z);
    }
}
exports.Point3D = Point3D;
class Demolished2D {
    constructor(canvas, w, h) {
        this.canvas = canvas;
        this.w = w;
        this.entities = new Array();
        this.ctx = canvas.getContext("2d");
        this.animationStartTime = 0;
        if (!w && !h)
            this.resizeCanvas();
    }
    clear() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
    animate(time) {
        let animationTime = time - this.animationStartTime;
        this.animationFrameId = requestAnimationFrame((_time) => {
            this.animate(_time);
        });
        this.renderEntities(time);
    }
    addEntity(ent) {
        this.entities.push(ent);
    }
    resizeCanvas() {
        let width = window.innerWidth / 2;
        let height = window.innerHeight / 2;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    }
    renderEntities(time) {
        this.clear();
        this.entities.forEach((ent) => {
            ent.update(time);
        });
    }
    start(startTime) {
        this.animate(startTime);
    }
}
exports.Demolished2D = Demolished2D;
