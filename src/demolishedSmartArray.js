"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class SmartArray extends Array {
    constructor(array) {
        super();
        this.take = (n) => this.splice(this.currentIndex, n);
        this.skip = (x) => this.currentIndex = x;
        this.first = () => this.dataArray[0];
        this.add = (x, y) => x + y;
        this.sum = xs => xs.reduce(this.add, 0);
        this.average = xs => xs[0] === undefined ? NaN : this.sum(xs) / xs.length;
        this.delta = ([x, ...xs]) => xs.reduce(([acc, last], x) => [
            [...acc, x - last], x
        ], [
            [], x
        ])[0];
        if (array instanceof Array) {
            this.dataArray = array;
        }
        else
            this.dataArray = new Array();
        this.currentIndex = 0;
    }
    get interpolate() {
        if (!this.dataArray.length)
            return 0;
        const counts = {};
        let mode = null;
        let max = 0;
        this.dataArray.forEach(item => {
            const value = Math.round(item * 10) / 10;
            counts[value] = (counts[value] || 0) + 1;
            if (counts[value] > max) {
                max = counts[value];
                mode = value;
            }
        });
        return mode;
    }
    median() {
        if (!this.dataArray.length)
            return 0;
        const midPoint = Math.floor(this.dataArray.length / 2);
        return this.dataArray[midPoint];
    }
    empty() {
        this.dataArray.length = 0;
    }
}
exports.SmartArray = SmartArray;
