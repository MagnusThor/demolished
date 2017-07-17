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
var demolishedCanvas_1 = require("../../../src/demolishedCanvas");
var Scroller2D = (function (_super) {
    __extends(Scroller2D, _super);
    function Scroller2D(ctx, text) {
        var _this = _super.call(this, "scroller", ctx) || this;
        _this.text = text;
        _this.textWidth = 0;
        _this.y = 10;
        _this.x = 0;
        _this.font = "12px Arial";
        _this.x = ctx.canvas.width;
        ctx.fillStyle = "#FFFFFF";
        _this.textWidth = ctx.measureText(_this.text).width;
        _this.active = true;
        _this.y = ctx.canvas.height - 48;
        return _this;
    }
    Scroller2D.prototype.update = function (time) {
        if (this.textWidth + this.x < 0) {
            this.x = this.ctx.canvas.width;
        }
        else {
            this.x--;
        }
        this.ctx.font = this.font;
        this.ctx.fillText(this.text, this.x, this.y);
    };
    return Scroller2D;
}(demolishedCanvas_1.BaseEntity2D));
exports.Scroller2D = Scroller2D;
