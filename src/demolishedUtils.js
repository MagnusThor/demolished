"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AudioWaveform = (function () {
    function AudioWaveform(audioBuffer, audio) {
        this.audioBuffer = audioBuffer;
        this.audio = audio;
        this.smoothing = 2;
        this.RMS = function (values) {
            return Math.sqrt(values.reduce(function (sum, value) { return sum + Math.pow(value, 2); }, 0) / values.length);
        };
        this.avg = function (values) {
            return values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
        };
        this.max = function (values) {
            return values.reduce(function (max, value) { return Math.max(max, value); }, 0);
        };
        var svg = document.querySelector('svg');
        this.progress = svg.querySelector('#progress');
        this.remaining = svg.querySelector('#remaining');
        this.width = parseInt(svg.getAttribute('width'));
        this.height = parseInt(svg.getAttribute('height'));
        var waveformData = this.getWaveformData(audioBuffer, this.width / this.smoothing);
        svg.querySelector('path').setAttribute('d', this.getSVGPath(waveformData));
        this.svg = svg;
    }
    AudioWaveform.prototype.getWaveformData = function (audioBuffer, dataPoints) {
        var leftChannel = audioBuffer.getChannelData(0);
        var rightChannel = audioBuffer.getChannelData(1);
        var values = new Float32Array(dataPoints);
        var dataWindow = Math.round(leftChannel.length / dataPoints);
        for (var i = 0, y = 0, buffer = []; i < leftChannel.length; i++) {
            var summedValue = (Math.abs(leftChannel[i]) + Math.abs(rightChannel[i])) / 2;
            buffer.push(summedValue);
            if (buffer.length === dataWindow) {
                values[y++] = this.avg(buffer);
                buffer = [];
            }
        }
        return values;
    };
    AudioWaveform.prototype.getSVGPath = function (waveformData) {
        var maxValue = this.max(waveformData);
        var path = "M 0 " + this.height + " ";
        for (var i = 0; i < waveformData.length; i++) {
            path += "L " + i * this.smoothing + " " + (1 - waveformData[i] / maxValue) * this.height + " ";
        }
        path += "V " + this.height + " H 0 Z";
        return path;
    };
    AudioWaveform.prototype.updateAudioPosition = function () {
        var _a = this.audio, currentTime = _a.currentTime, duration = _a.duration;
        var physicalPosition = (currentTime * 1000) / duration * this.width;
        if (physicalPosition) {
            this.progress.setAttribute('width', physicalPosition);
            this.remaining.setAttribute('x', physicalPosition);
            this.remaining.setAttribute('width', this.width - physicalPosition);
        }
    };
    return AudioWaveform;
}());
exports.AudioWaveform = AudioWaveform;
var Utils = (function () {
    function Utils() {
    }
    Utils.$ = function (query, parent) {
        return parent ? parent.querySelector(query) : document.querySelector(query);
    };
    Utils.$$ = function (query, parent) {
        var results = new Array();
        var queryResult = parent ? parent.querySelectorAll(query) : document.querySelectorAll(query);
        for (var i = 0; i < queryResult.length; i++)
            results.push(queryResult.item(i));
        return results;
    };
    Utils.el = function (p, textContent, attr) {
        var node;
        typeof (p) === "string" ? node = document.createElement(p) : node = p;
        if (textContent)
            node.textContent = textContent;
        if (attr) {
            Object.keys(attr).forEach(function (k) {
                node.setAttribute(k, attr[k]);
            });
        }
        return node;
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
var IncludeDefinition = (function () {
    function IncludeDefinition(path) {
        this.path = path;
    }
    return IncludeDefinition;
}());
exports.IncludeDefinition = IncludeDefinition;
var ImportsParser = (function () {
    function ImportsParser() {
    }
    ImportsParser.parseIncludes = function (data) {
        var regex = new RegExp('#include\\s"(.*)"', 'g');
        var matcher = regex.exec(data);
        var result = new Array();
        while (matcher != null) {
            result.push(new IncludeDefinition(matcher[1]));
            matcher = regex.exec(data);
        }
        return result;
    };
    return ImportsParser;
}());
exports.ImportsParser = ImportsParser;
var ShaderCompiler = (function () {
    function ShaderCompiler() {
        this.lastCompile = performance.now();
        this.isCompiling = false;
        this.canvas = document.createElement("canvas");
        this.gl = this.canvas.getContext("webgl");
    }
    Object.defineProperty(ShaderCompiler, "vertexHeader", {
        get: function () {
            var header = "";
            header += "#version 300 es\n" +
                "#ifdef GL_ES\n" +
                "precision highp float;\n" +
                "precision highp int;\n" +
                "precision mediump sampler3D;\n" +
                "#endif\n";
            return header;
        },
        enumerable: true,
        configurable: true
    });
    ShaderCompiler.parseIncludes = function (source, shared) {
        var results = ImportsParser.parseIncludes(source);
        results.map(function (x) {
            source = source.replace('#include "' + x.path + '";', shared.get(x.path));
        });
        return source;
    };
    Object.defineProperty(ShaderCompiler, "fragmentHeader", {
        get: function () {
            var header = "";
            header += "#version 300 es\n" +
                "#ifdef GL_ES\n" +
                "precision highp float;\n" +
                "precision highp int;\n" +
                "precision mediump sampler3D;\n" +
                "#endif\n";
            return header;
        },
        enumerable: true,
        configurable: true
    });
    ShaderCompiler.prototype.onError = function (error) {
        throw "Not implememnted";
    };
    ShaderCompiler.prototype.onSuccess = function (source, header) {
        throw "Not implemented";
    };
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
    ShaderCompiler.prototype.canCompile = function () {
        var bounce = -(this.lastCompile - performance.now());
        return bounce > 500. && !this.isCompiling;
    };
    ShaderCompiler.prototype.compile = function (fragmentShader, fragmentHeader) {
        if (!fragmentHeader)
            fragmentHeader = ShaderCompiler.fragmentHeader;
        this.isCompiling = true;
        var gl = this.gl;
        var compileResults = this.createShader(fragmentHeader + fragmentShader, gl.FRAGMENT_SHADER);
        if (compileResults.length > 0) {
            this.isCompiling = false;
            this.lastCompile = performance.now();
            this.onError(compileResults);
        }
        else {
            this.isCompiling = false;
            this.lastCompile = performance.now();
            this.onSuccess(fragmentShader, fragmentHeader);
        }
    };
    ShaderCompiler.prototype.createShader = function (src, type) {
        var gl = this.gl;
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            return this.toErrorLines(gl.getShaderInfoLog(shader));
        }
        else
            return new Array();
    };
    return ShaderCompiler;
}());
exports.ShaderCompiler = ShaderCompiler;
