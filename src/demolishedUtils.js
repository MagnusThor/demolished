"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = (function () {
    function Utils() {
    }
    Utils.$ = function (query, parent) {
        return parent ? parent.querySelector(query) : document.querySelector(query);
    };
    Utils.$$ = function (query, parent) {
        var results = new Array();
        var queryResult = parent ? parent.querySelectorAll(query) : document.querySelectorAll(query);
        for (var i = 0; i < queryResult.length;)
            results.push(queryResult.item(i));
        return results;
    };
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
var ShaderError = (function () {
    function ShaderError(line, error) {
        this.line = line;
        this.error = error;
    }
    return ShaderError;
}());
exports.ShaderError = ShaderError;
var ShaderCompiler = (function () {
    function ShaderCompiler() {
        this.canvas = document.createElement("canvas");
        this.gl = this.canvas.getContext("webgl");
    }
    ShaderCompiler.prototype.toErrorLines = function (error) {
        var index = 0;
        var indexEnd = 0;
        var lineNum = 0;
        var errorLines = new Array();
        while (index >= 0) {
            index = error.indexOf("ERROR: 0:", index);
            if (index < 0) {
                break;
            }
            index += 9;
            indexEnd = error.indexOf(':', index);
            if (indexEnd > index) {
                lineNum = parseInt(error.substring(index, indexEnd));
                if ((!isNaN(lineNum)) && (lineNum > 0)) {
                    index = indexEnd + 1;
                    indexEnd = error.indexOf("ERROR: 0:", index);
                    var lineError = (indexEnd > index) ? error.substring(index, indexEnd) : error.substring(index);
                    errorLines.push(new ShaderError(lineNum, lineError));
                }
            }
        }
        return errorLines;
    };
    ShaderCompiler.prototype.compile = function (fs) {
        var gl = this.gl;
        var compileResults = this.createShader(fs, gl.FRAGMENT_SHADER);
        return compileResults;
    };
    ShaderCompiler.prototype.createShader = function (src, type) {
        var gl = this.gl;
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            return this.toErrorLines(gl.getShaderInfoLog(shader));
        }
        else
            return new Array();
    };
    return ShaderCompiler;
}());
exports.ShaderCompiler = ShaderCompiler;
