export class AudioWaveform {

    smoothing: number = 2;

    RMS = values => {
        return Math.sqrt(values.reduce((sum, value) => sum + Math.pow(value, 2), 0) / values.length);
    };

    avg = values => {
        return values.reduce((sum: number, value: number) => sum + value, 0) / values.length;
    };
    max = values => {
        return values.reduce((max: number, value: number) => Math.max(max, value), 0);
    };

    svg: SVGSVGElement;
    progress: any;
    remaining: any;
    width: number;
    height: number;
  
    getWaveformData(audioBuffer: AudioBuffer, dataPoints: number): Float32Array {
        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = audioBuffer.getChannelData(1);
        const values = new Float32Array(dataPoints);
        const dataWindow = Math.round(leftChannel.length / dataPoints);
        for (let i = 0, y = 0, buffer = []; i < leftChannel.length; i++) {
            const summedValue = (Math.abs(leftChannel[i]) + Math.abs(rightChannel[i])) / 2;
            buffer.push(summedValue);
            if (buffer.length === dataWindow) {
                values[y++] = this.avg(buffer);
                buffer = [];
            }
        }
        return values;
    }
    getSVGPath(waveformData: Float32Array) {
        const maxValue = this.max(waveformData);

        let path = `M 0 ${this.height} `;
        for (let i = 0; i < waveformData.length; i++) {
            path += `L ${i * this.smoothing} ${(1 - waveformData[i] / maxValue) * this.height} `;
        }
        path += `V ${this.height} H 0 Z`;
        return path;
    }

    constructor(public audioBuffer:AudioBuffer,public audio:HTMLAudioElement) {
        let svg = document.querySelector('svg');
        this.progress = svg.querySelector('#progress');
        this.remaining = svg.querySelector('#remaining');
        this.width = parseInt(svg.getAttribute('width'));
        this.height = parseInt(svg.getAttribute('height'));


        const waveformData = this.getWaveformData(audioBuffer, this.width / this.smoothing);

        svg.querySelector('path').setAttribute('d', this.getSVGPath(waveformData));
 
        this.svg = svg;
    }

    updateAudioPosition() {
        const { currentTime, duration } = this.audio;
        const physicalPosition = (currentTime * 1000)  / duration * this.width;
        if (physicalPosition) {
            this.progress.setAttribute('width', physicalPosition);
            this.remaining.setAttribute('x', physicalPosition);
            this.remaining.setAttribute('width', this.width - physicalPosition);
        }
    }

   

}

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
    static $(query: string, parent?: Element): Element {
        return parent ? parent.querySelector(query) : document.querySelector(query)
    }
    static $$(query: string, parent?: Element): Array<Element> {
        var results = new Array<Element>();
        let queryResult = parent ? parent.querySelectorAll(query) : document.querySelectorAll(query)
        for (let i = 0; i < queryResult.length; i++) results.push(queryResult.item(i));
        return results;
    }
    /**
    * Create a new HTMLElement with textContent and attributes.
    *
    * @static
    * @param {(stringe | HTMLElement)} p
    * @param {string} [textContent]
    * @param {Object} [attr]
    * @returns {HTMLElement}
    * @memberof Utils
    */
    static el(p: string | HTMLElement, textContent?: string, attr?: Object): HTMLElement {
        let node: HTMLElement;
        typeof (p) === "string" ? node = document.createElement(p) : node = p;
        if (textContent)
            node.textContent = textContent;
        if (attr) {
            Object.keys(attr).forEach((k: string) => {
                node.setAttribute(k, attr[k]);
            });
        }
        return node;
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

export class ShaderError {
    line: number;
    error: string;
    constructor(line: number, error: string) {
        this.line = line;
        this.error = error;
    }
}

export class IncludeDefinition {
    constructor(path: string) {
        this.path = path;
    }
    path: string;
}

export class ImportsParser {
    static parseIncludes(data: string): Array<IncludeDefinition> {
        let regex = new RegExp('#include\\s"(.*)"', 'g');
        let matcher = regex.exec(data);
        let result = new Array<IncludeDefinition>();
        while (matcher != null) {
            result.push(new IncludeDefinition(matcher[1]));
            matcher = regex.exec(data);
        }
        return result;
    }
}

export class ShaderCompiler {

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

    static parseIncludes(source: string, shared: Map<string, string>): string {

        let results = ImportsParser.parseIncludes(source);
        results.map(x => {
            source = source.replace('#include "' + x.path + '";', shared.get(x.path));
        });
        return source;
    }

    static get fragmentHeader(): string {
        let header = "";
        header += "#version 300 es\n" +
            "#ifdef GL_ES\n" +
            "precision highp float;\n" +
            "precision highp int;\n" +
            "precision mediump sampler3D;\n" +
            "#endif\n"
        return header;
    }
    private gl: WebGLRenderingContext;
    private canvas: HTMLCanvasElement;
    public isCompiling: boolean;
    public lastCompile: number;
    constructor() {
        this.lastCompile = performance.now();
        this.isCompiling = false;
        this.canvas = document.createElement("canvas") as HTMLCanvasElement;
        this.gl = this.canvas.getContext("webgl");
    }

    onError(error: Array<ShaderError>) {
        throw "Not implememnted";
    }

    onSuccess(source: string, header: string) {
        throw "Not implemented";
    }

    private toErrorLines(error: string): Array<ShaderError> {
        let index = 0;
        let indexEnd: number = 0;
        let lineNum: number = 0;
        let errorLines = new Array<ShaderError>();
        while (index >= 0) {
            index = error.indexOf("ERROR: 0:", index);
            if (index < 0) { break; }
            index += 9;
            indexEnd = error.indexOf(':', index);
            if (indexEnd > index) {
                lineNum = parseInt(error.substring(index, indexEnd));
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

    public canCompile(): boolean {
        let bounce = -(this.lastCompile - performance.now());
        return bounce > 500. && !this.isCompiling;
    }


    /**
     * Compiles the fragment/vertex edited by the user , uses the imports, headers etc
     *  passes back the assembled result.
     * @param {string} fragmentShader
     * @param {string} [fragmentHeader]
     * @memberof ShaderCompiler
     */
    public compile(fragmentShader: string, fragmentHeader?: string) {

        if (!fragmentHeader) fragmentHeader = ShaderCompiler.fragmentHeader;

        this.isCompiling = true;
        let gl = this.gl;

        let compileResults = this.createShader(fragmentHeader + fragmentShader, gl.FRAGMENT_SHADER)

        if (compileResults.length > 0) {
            this.isCompiling = false;
            this.lastCompile = performance.now();
            this.onError(compileResults);
        } else {

            this.isCompiling = false;
            this.lastCompile = performance.now();
            this.onSuccess(fragmentShader, fragmentHeader);
        }
    }

    private createShader(src: string, type: number): Array<ShaderError> {
        let gl = this.gl;



        let shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            return this.toErrorLines(gl.getShaderInfoLog(shader));
        } else
            return new Array<ShaderError>();

    }

}
