"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const demolished2D_1 = require("./src/demolished2D");
class SpectrumAnalyzer extends demolished2D_1.BaseEntity2D {
    constructor(ctx) {
        super("spectrumAnalyzer", ctx);
        this.ctx = ctx;
        this.active = true;
        this.bars = 60;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.strokeStyle = "#ffffff";
        this.frequencData = new Uint8Array(8192);
    }
    update(time) {
        let sum = 0;
        let binSize = Math.floor(8192 / this.bars);
        for (var i = 0; i < this.bars; i += 1) {
            sum = 0;
            for (var j = 0; j < binSize; j += 1) {
                sum += this.frequencData[(i * binSize) + j];
            }
            let average = sum / binSize;
            let barWith = this.ctx.canvas.width / this.bars;
            let scaled_average = (average / 256) * this.height;
            this.ctx.fillRect(i * barWith + 20, this.ctx.canvas.height, barWith - 2, -scaled_average);
        }
    }
}
exports.SpectrumAnalyzer = SpectrumAnalyzer;
