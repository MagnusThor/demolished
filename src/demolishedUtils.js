"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Utils {
    static $(query, parent) {
        return parent ? parent.querySelector(query) : document.querySelector(query);
    }
    static $$(query, parent) {
        var results = new Array();
        let queryResult = parent ? parent.querySelectorAll(query) : document.querySelectorAll(query);
        for (let i = 0; i < queryResult.length; i++)
            results.push(queryResult.item(i));
        return results;
    }
    static el(p, textContent, attr) {
        let node;
        typeof (p) === "string" ? node = document.createElement(p) : node = p;
        if (textContent)
            node.textContent = textContent;
        if (attr) {
            Object.keys(attr).forEach((k) => {
                node.setAttribute(k, attr[k]);
            });
        }
        return node;
    }
    static getExponentOfTwo(value, max) {
        var count = 1;
        do {
            count *= 2;
        } while (count < value);
        if (count > max)
            count = max;
        return count;
    }
    static convertBuffer(buffer) {
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
Utils.Audio = {
    getPeaksAtThreshold(data, sampleRate, threshold) {
        let peaksArray = new Array();
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
};
exports.Utils = Utils;
class ShaderError {
    constructor(line, error) {
        this.line = line;
        this.error = error;
    }
}
exports.ShaderError = ShaderError;
class GLSLInclude {
    constructor() {
        this.numofIncludes = 0;
        this.offset = -1;
        this.linesIncluded = 0;
    }
    parseInclude(data) {
        let regex = new RegExp('"(.*)"', 'g');
        let matcher = regex.exec(data);
        if (!matcher)
            return "";
        return matcher[1];
    }
    parse(source, shared) {
        let lines = source.split("\n");
        let fullSource = "";
        let count = 0;
        lines.forEach((line, index) => {
            const include = line.indexOf("#include ") > -1;
            if (!include) {
                this.offset = index;
                fullSource += line + "\n";
                this.numofIncludes++;
            }
            else {
                try {
                    const es = shared.get(this.parseInclude(line));
                    if (!es)
                        throw "Unable to fetch/resolve the included file - " + line;
                    count += es.split("\n").length;
                    fullSource += es;
                }
                catch (ex) {
                    console.log(ex);
                }
            }
        });
        this.linesIncluded = count;
        return fullSource;
    }
}
exports.GLSLInclude = GLSLInclude;
class ShaderCompiler {
    static get vertexHeader() {
        let header = "";
        header += "#version 300 es\n" +
            "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "precision highp int;\n" +
            "precision mediump sampler3D;\n" +
            "#endif\n";
        return header;
    }
    static parseIncludes(source, shared) {
        let p = new GLSLInclude();
        source = p.parse(source, shared);
        ShaderCompiler.offset = p.linesIncluded;
        return source;
    }
    static get fragmentHeader() {
        let header = "";
        header += "#version 300 es\n" +
            "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "precision highp int;\n" +
            "precision mediump sampler3D;\n" +
            "#endif\n";
        return header;
    }
    constructor() {
        this.lastCompile = performance.now();
        this.isCompiling = false;
        const canvas = document.createElement("canvas");
        this.gl = canvas.getContext("webgl");
    }
    onError(error) {
        throw "Not implememnted";
    }
    onSuccess(source) {
        throw "Not implemented";
    }
    toErrorLines(error) {
        let index = 0;
        let indexEnd = 0;
        let lineNum = 0;
        let errorLines = new Array();
        while (index >= 0) {
            index = error.indexOf("ERROR: 0:", index);
            if (index < 0) {
                break;
            }
            index += 9;
            indexEnd = error.indexOf(':', index);
            if (indexEnd > index) {
                lineNum = parseInt(error.substring(index, indexEnd));
                lineNum -= (ShaderCompiler.offset - 2);
                if ((!isNaN(lineNum)) && (lineNum > 0)) {
                    index = indexEnd + 1;
                    indexEnd = error.indexOf("ERROR: 0:", index);
                    let lineError = (indexEnd > index) ? error.substring(index, indexEnd) : error.substring(index);
                    errorLines.push(new ShaderError(lineNum, lineError));
                }
            }
        }
        return errorLines;
    }
    canCompile() {
        let bounce = -(this.lastCompile - performance.now());
        return bounce > 500. && !this.isCompiling;
    }
    compile(fragmentShader, shared) {
        fragmentShader = ShaderCompiler.parseIncludes(fragmentShader, shared);
        this.isCompiling = true;
        let gl = this.gl;
        let compileResults = this.tryCreateShader(fragmentShader, gl.FRAGMENT_SHADER);
        if (compileResults.length > 0) {
            this.isCompiling = false;
            this.lastCompile = performance.now();
            this.onError(compileResults);
        }
        else {
            this.isCompiling = false;
            this.lastCompile = performance.now();
            this.onSuccess(fragmentShader);
        }
    }
    tryCreateShader(src, type) {
        let gl = this.gl;
        let shader = gl.createShader(type);
        let header = type == this.gl.FRAGMENT_SHADER ? ShaderCompiler.fragmentHeader : ShaderCompiler.vertexHeader;
        gl.shaderSource(shader, header + src);
        gl.compileShader(shader);
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            return this.toErrorLines(gl.getShaderInfoLog(shader));
        }
        else
            return new Array();
    }
}
exports.ShaderCompiler = ShaderCompiler;
