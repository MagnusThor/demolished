"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BaseEntity2D = (function () {
    function BaseEntity2D(name, ctx) {
        this.name = name;
        this.ctx = ctx;
        this.width = ctx.canvas.width;
        this.height = ctx.canvas.height;
    }
    BaseEntity2D.prototype.update = function (t) {
    };
    BaseEntity2D.prototype.getPixels = function () {
        return this.ctx.getImageData(0, 0, this.width, this.height);
    };
    BaseEntity2D.prototype.putPixels = function () {
        throw "not implemented";
    };
    return BaseEntity2D;
}());
exports.BaseEntity2D = BaseEntity2D;
var Point3D = (function () {
    function Point3D(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Point3D.prototype.rotateX = function (angle) {
        var rad, cosa, sina, y, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        y = this.y * cosa - this.z * sina;
        z = this.y * sina + this.z * cosa;
        return new Point3D(this.x, y, z);
    };
    Point3D.prototype.rotateY = function (angle) {
        var rad, cosa, sina, x, z;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        z = this.z * cosa - this.x * sina;
        x = this.z * sina + this.x * cosa;
        return new Point3D(x, this.y, z);
    };
    Point3D.prototype.rotateZ = function (angle) {
        var rad, cosa, sina, x, y;
        rad = angle * Math.PI / 180;
        cosa = Math.cos(rad);
        sina = Math.sin(rad);
        x = this.x * cosa - this.y * sina;
        y = this.x * sina + this.y * cosa;
        return new Point3D(x, y, this.z);
    };
    Point3D.prototype.length = function () {
        var length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        return length;
    };
    Point3D.prototype.scale = function (scale) {
        this.x *= scale;
        this.y *= scale;
        this.z *= scale;
    };
    Point3D.prototype.normalize = function () {
        var lengthval = this.length();
        if (lengthval != 0) {
            this.x /= lengthval;
            this.y /= lengthval;
            this.z /= lengthval;
            return true;
        }
        else {
            return false;
        }
    };
    Point3D.prototype.angle = function (bvector) {
        var anorm = new Point3D(this.x, this.y, this.z);
        anorm.normalize();
        var bnorm = new Point3D(bvector.x, bvector.y, bvector.z);
        bnorm.normalize();
        var dotval = anorm.dot(bnorm);
        return Math.acos(dotval);
    };
    Point3D.prototype.cross = function (vectorB) {
        var tempvec = new Point3D(this.x, this.y, this.z);
        tempvec.x = (this.y * vectorB.z) - (this.z * vectorB.y);
        tempvec.y = (this.z * vectorB.x) - (this.x * vectorB.z);
        tempvec.z = (this.x * vectorB.y) - (this.y * vectorB.x);
        this.x = tempvec.x;
        this.y = tempvec.y;
        this.z = tempvec.z;
    };
    Point3D.prototype.dot = function (vectorB) {
        return this.x * vectorB.x + this.y * vectorB.y + this.z * vectorB.z;
    };
    Point3D.prototype.project = function (width, height, fov, distance) {
        var factor, x, y;
        factor = fov / (distance + this.z);
        x = this.x * factor + width / 2;
        y = this.y * factor + height / 2;
        return new Point3D(x, y, this.z);
    };
    return Point3D;
}());
exports.Point3D = Point3D;
var Demolished2D = (function () {
    function Demolished2D(canvas, w, h) {
        this.canvas = canvas;
        this.w = w;
        this.entities = new Array();
        this.ctx = canvas.getContext("2d");
        this.animationStartTime = 0;
        if (!w && !h)
            this.resizeCanvas();
    }
    Demolished2D.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    };
    Demolished2D.prototype.animate = function (time) {
        var _this = this;
        var animationTime = time - this.animationStartTime;
        this.animationFrameId = requestAnimationFrame(function (_time) {
            _this.animate(_time);
        });
        this.renderEntities(time);
    };
    Demolished2D.prototype.addEntity = function (ent) {
        this.entities.push(ent);
    };
    Demolished2D.prototype.resizeCanvas = function () {
        var width = window.innerWidth / 2;
        var height = window.innerHeight / 2;
        this.canvas.width = width;
        this.canvas.height = height;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    };
    Demolished2D.prototype.renderEntities = function (time) {
        this.clear();
        this.entities.forEach(function (ent) {
            ent.update(time);
        });
    };
    Demolished2D.prototype.start = function (startTime) {
        this.animate(startTime);
    };
    return Demolished2D;
}());
exports.Demolished2D = Demolished2D;
