"use strict";
/**
    * Utils
    *
    * @export
    * @class Utils
    */
var Utils = (function () {
    function Utils() {
    }
    Utils.getExponentOfTwo = function (value, max) {
        var count = 1;
        do {
            count *= 2;
        } while (count < value);
        if (count > max)
            count = max;
        return count;
    };
    Utils.convertBuffer = function (buffer) {
        var data = new DataView(buffer);
        var tempArray = new Float32Array(1024 * 1024 * 4);
        var len = tempArray.length;
        for (var jj = 0; jj < len; ++jj) {
            tempArray[jj] =
                data.getFloat32(jj * Float32Array.BYTES_PER_ELEMENT, true);
        }
        return tempArray;
    };
    Utils.Audio = {
        getPeaksAtThreshold: function (data, sampleRate, threshold) {
            var peaksArray = new Array();
            var length = data.length;
            var skipRatio = 5;
            for (var i = 0; i < length;) {
                if (data[i] > threshold) {
                    peaksArray.push(i);
                    i += sampleRate / skipRatio;
                }
                i++;
            }
            return peaksArray;
        }
    };
    Utils.Array = {
        add: function (x, y) { return x + y; },
        sum: function (xs) { return xs.reduce(Utils.Array.add, 0); },
        average: function (xs) { return xs[0] === undefined ? NaN : Utils.Array.sum(xs) / xs.length; },
        delta: function (_a) {
            var x = _a[0], xs = _a.slice(1);
            return xs.reduce(function (_a, x) {
                var acc = _a[0], last = _a[1];
                return [acc.concat([x - last]), x];
            }, [[], x])[0];
        }
    };
    return Utils;
}());
exports.Utils = Utils;
