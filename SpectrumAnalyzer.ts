import { BaseEntity2D, IEntity2D } from './src/demolished2D';
export class SpectrumAnalyzer extends BaseEntity2D implements IEntity2D {
    start: 0;
    stop: 0;
    active: true;
    constructor(public ctx: CanvasRenderingContext2D) {
        super("spectrumAnalyzer", ctx);
        this.active = true;
        this.bars = 60;
        this.ctx.fillStyle = "#ffffff";
        this.ctx.strokeStyle = "#ffffff";
        this.frequencData = new Uint8Array(8192);
    }
    bars: number;
    frequencData: Uint8Array;
    // todo: scale_average must be relative
    update(time: number) {
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
