export class SmartArray<T> extends Array {
    dataArray: Array < any > ;
    constructor(array: Array < any > ) {
        super();
        if (array instanceof Array) {
            this.dataArray = array;
        } else
            this.dataArray = new Array<T>();
            this.currentIndex  =0;
    }
    get mode() {
        if (!this.dataArray.length) return 0;
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
    currentIndex:number;
    median() {
        if (!this.dataArray.length) return 0;
        const midPoint = Math.floor(this.dataArray.length / 2);
        return this.dataArray[midPoint];
    }
    take = (n:number) => this.splice(this.currentIndex,n);
    skip = (x:number) => this.currentIndex = x;

    first = () => this.dataArray[0];
    add = (x, y) => x + y;
    sum = xs => xs.reduce(this.add, 0);
    average = xs => xs[0] === undefined ? NaN : this.sum(xs) / xs.length;
    delta = ([x, ...xs]) =>
        xs.reduce(([acc, last], x) => [
            [...acc, x - last], x
        ], [
            [], x
        ])[0];

    empty() {
        this.dataArray.length = 0;
    }
}