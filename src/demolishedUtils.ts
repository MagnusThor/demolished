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

export class ShaderError{
        line:number;
        error: string;
        constructor(line:number,error:string){
            this.line = line;
            this.error = error;
        }
}

export class ShaderCompiler
{
        private gl: WebGLRenderingContext;
        private canvas: HTMLCanvasElement;
        constructor(){
            this.canvas = document.createElement("canvas") as HTMLCanvasElement;
            this.gl = this.canvas.getContext("webgl");
        }
        private toErrorLines(error:string):Array<ShaderError>{
            let index = 0;
            let indexEnd:number = 0;
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
                        let lineError =(indexEnd > index) ? error.substring(index, indexEnd) : error.substring(index);
                        errorLines.push(new ShaderError(lineNum,lineError));
                    }
                }
            }
            return errorLines;
        }

        public compile(fs:string):Array<ShaderError>{
                let gl = this.gl;
                let compileResults=  this.createShader(fs,gl.FRAGMENT_SHADER)
                return compileResults;
        }
        
        private createShader(src:string,type:number):Array<ShaderError>{
            let gl = this.gl;
            let shader = gl.createShader( type);    
            gl.shaderSource( shader, src );
            gl.compileShader( shader );
            if (!gl.getShaderParameter( shader, gl.COMPILE_STATUS ) ) {
                return this.toErrorLines(gl.getShaderInfoLog( shader ));
            }else   
                   return new Array<ShaderError>();

        }

}
