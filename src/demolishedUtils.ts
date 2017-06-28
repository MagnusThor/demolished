/**
    * Utils
    * 
    * @export
    * @class Utils
    */
export class Utils {

    static Audio = {
        getPeaksAtThreshold(data: Float32Array, sampleRate: number, threshold: number) {
            let peaksArray = new Array<number>();
            let length = data.length;
            let skipRatio = 5;
            for (let i = 0; i < length;) {
                if (data[i] > threshold) {
                    peaksArray.push(i);
                    i += sampleRate / skipRatio;
                }
                i++;
            }
            return peaksArray;
        }

    }

    static Array = {
        add: (x, y) => x + y,
        sum: xs => xs.reduce(Utils.Array.add, 0),
        average: xs => xs[0] === undefined ? NaN : Utils.Array.sum(xs) / xs.length,
        delta: ([x, ...xs]) =>
            xs.reduce(([acc, last], x) => [[...acc, x - last], x], [[], x])[0]
    }

    static getExponentOfTwo(value: number, max: number): number {
        var count = 1;
        do {
            count *= 2;
        } while (count < value);

        if (count > max)
            count = max;

        return count;
    }


    static convertBuffer(buffer: ArrayBuffer): Float32Array {
        var data = new DataView(buffer);
        var tempArray = new Float32Array(1024 * 1024 * 4);
        var len = tempArray.length;

        for (var jj = 0; jj < len; ++jj) {
            tempArray[jj] =
                data.getFloat32(jj * Float32Array.BYTES_PER_ELEMENT, true);
        }

        return tempArray;

    }
}
