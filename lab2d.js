"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var demolished2D_1 = require("./src/demolished2D");
var TextEffect = (function (_super) {
    __extends(TextEffect, _super);
    function TextEffect(name, ctx, text, x, y, font) {
        var _this = _super.call(this, name, ctx) || this;
        _this.text = text;
        _this.x = x;
        _this.y = y;
        _this.font = font;
        _this.active = true;
        return _this;
    }
    TextEffect.prototype.update = function (time) {
        var ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = "#fff";
        ctx.font = this.font;
        var dx = this.width / 2;
        var dy = this.height / 2;
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 10;
        var sx = Math.random() * 2;
        var sy = Math.random() * 2;
        ctx.translate(sx, sy);
        ctx.strokeRect(20, 20, 512 - 40, 512 - 40);
        ctx.stroke();
        ctx.fillText(this.text, this.x, this.y, this.width - 120);
        ctx.restore();
    };
    ;
    return TextEffect;
}(demolished2D_1.BaseEntity2D));
exports.TextEffect = TextEffect;
var Lab2d = (function () {
    function Lab2d(el) {
        var Render2D = new demolished2D_1.Demolished2D(el, 512, 512);
        Render2D.addEntity(new TextEffect("textBlock", Render2D.ctx, "GIN & TONIC", 60, 240, "128px 'Arial'"));
        Render2D.addEntity(new TextEffect("textBlock", Render2D.ctx, "JENNY", 80, 380, "bold 128px 'Arial'"));
        Render2D.start(0);
    }
    Lab2d.getInstance = function (el) {
        return new this(el);
    };
    return Lab2d;
}());
exports.Lab2d = Lab2d;
document.addEventListener("DOMContentLoaded", function () {
    Lab2d.getInstance(document.querySelector("#foo"));
});
