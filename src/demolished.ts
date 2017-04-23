if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function () {
        return function (callback) {
            return window.setTimeout(callback, 1000 / 60);
        };
    })();
}


export namespace Demolished {
    export class EnityBase {

        currentProgram: any

        vertexShader: string;
        fragmetShader: string

        buffer: WebGLBuffer;
        vertexPosition: any;
        positionAttribute: any;


        isLoaded: boolean;

        constructor(public gl: WebGLRenderingContext, public name: string) {
            this.loadResources().then(() => {
                this.init();
            });
        }

        loadResources(): Promise<boolean> {
            let urls = new Array<string>();

            urls.push("entities/" + this.name + "/fragment.glsl");
            urls.push("entities/" + this.name + "/vertex.glsl");
            urls.push("entities/" + this.name + "/uniforms.json");

            return Promise.all(urls.map(url =>
                fetch(url).then(resp => resp.text())
            )).then(result => {
                this.fragmetShader = result[0];
                this.vertexShader = result[1];
                return true;
            }).catch((reason) => {
                this.OnError(reason);
                return false;
            });
        }

        OnError: (err) => void;

        init() {

            let gl = this.gl;
            this.buffer = gl.createBuffer();


            //  let program = gl.createProgram();

            this.currentProgram = gl.createProgram();

            let vs = this.createShader(gl, this.vertexShader, gl.VERTEX_SHADER);
            let fs = this.createShader(gl, this.fragmetShader, gl.FRAGMENT_SHADER);

            gl.attachShader(this.currentProgram, vs);
            gl.attachShader(this.currentProgram, fs);

            gl.deleteShader(vs);
            gl.deleteShader(fs);

            gl.linkProgram(this.currentProgram);

            if (!gl.getProgramParameter(this.currentProgram, gl.LINK_STATUS)) {
                this.OnError(gl.getProgramInfoLog(this.currentProgram))
            }

            this.cacheUniformLocation(this.currentProgram, 'freq');
     
            this.cacheUniformLocation(this.currentProgram, 'time');
            this.cacheUniformLocation(this.currentProgram, 'mouse');
            this.cacheUniformLocation(this.currentProgram, 'resolution');
            this.cacheUniformLocation(this.currentProgram, 'surfaceSize');

            this.positionAttribute = gl.getAttribLocation(this.currentProgram, "surfacePosAttrib");
            gl.enableVertexAttribArray(this.positionAttribute);

            this.vertexPosition = gl.getAttribLocation(this.currentProgram, "position");
            gl.enableVertexAttribArray(this.vertexPosition);

            gl.useProgram(this.currentProgram);

            this.isLoaded = true;

        }

        cacheUniformLocation(program: any, label: string) {
            if (program.uniformsCache === undefined) {
                program.uniformsCache = {};
            }
            program.uniformsCache[label] = this.gl.getUniformLocation(program, label);
        }


        createShader(gl: WebGLRenderingContext, src: string, type: number): WebGLShader {
            let shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            return shader;
        }

    }


    export class RenderTarget {
        constructor(public frameBuffer: WebGLFramebuffer, public renderBuffer: WebGLFramebuffer,
            public texture: WebGLTexture) {
        }
    }

    export class World {
        nodes: Array<EnityBase>;
        canvas: HTMLCanvasElement;
        gl: WebGLRenderingContext;
        currentProgram: any

        target: RenderTarget;
        backTarget: RenderTarget;

        width: number = 1;
        height: number = 1;
        centerX: number = 0;
        centerY: number = 0;
        buffer: WebGLBuffer

        assets: Array<any>;

        // todo: define a class the represents the audio analyzer props
        audioAnalyser: AnalyserNode
        frequencyBinCount: number;


        private getRendringContext(): WebGLRenderingContext {
            let gl: WebGLRenderingContext;

            gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')
            gl.getExtension('OES_standard_derivatives');

            this.buffer = gl.createBuffer();

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(
                [- 1.0, - 1.0, 1.0, - 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0, 1.0, - 1.0, 1.0]
            ), gl.STATIC_DRAW)

            return gl;
        }

        constructor() {

            this.assets = new Array<any>();

            this.nodes = new Array<EnityBase>();
            this.canvas = document.querySelector("#gl") as HTMLCanvasElement;
            this.gl = this.getRendringContext();

            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            this.target = this.createTarget(1, 1);
            this.backTarget = this.createTarget(1, 1);


            this.addEventListeners()

            this.loadMusic();

        }


        dataArray: Float32Array;
        loadMusic() {
            let context = new AudioContext();
         

            window.fetch("assets/song.mp3").then((response: Response) => {
                response.arrayBuffer().then((buffer: ArrayBuffer) => {
                    context.decodeAudioData(buffer, (audioBuffer: AudioBuffer) => {
                        let bufferSource = context.createBufferSource();
                    
                        this.audioAnalyser = context.createAnalyser();

                        bufferSource.buffer = audioBuffer;
                        bufferSource.loop = true;
                       

                        this.audioAnalyser.fftSize = 2048;
                        this.frequencyBinCount = this.audioAnalyser.frequencyBinCount;
                        this.dataArray = new Float32Array(this.frequencyBinCount);
                
                        bufferSource.connect(this.audioAnalyser);
                      bufferSource.connect(context.destination);
                      
                        bufferSource.start(0);

                    });

                });
            });


        }


        private doAudioThingy():number{
            
            let meterNum = 32;

            let arr = new Array<number>(meterNum);

            if(!this.dataArray ) return 0;
            this.audioAnalyser.getFloatFrequencyData(this.dataArray);
       
              var step = Math.round(this.dataArray.length / meterNum); 

             for (var i = 0; i < meterNum; i++) {
                var value = this.dataArray[i * step];
                   arr.push(value);
            }

            return arr.reduce( ( p, c ) => p + c, 0 ) / arr.length
        
        }

        private addEventListeners() {

            document.addEventListener("mousemove", (evt: MouseEvent) => {

                this.parameters.mouseX = evt.clientX / window.innerWidth;
                this.parameters.mouseY = 1 - evt.clientY / window.innerHeight;
            });
        }
        addEntity(name: string): EnityBase {

            const entity = new EnityBase(this.gl, name);
            this.nodes.push(entity);
            return entity;
        }
        init() {
            this.computeSurfaceCorners();  // todo: needs to be called OnResize
        }
        /**
         * 
         * 
         * 
         * @memberOf World
         */
        animate() {
            requestAnimationFrame(() => {
            
                this.animate();
            });
            this.renderEntities(this.nodes[0]);
        }
        private createTarget(width: number, height: number): RenderTarget {

            let gl = this.gl;
            let target = new RenderTarget(gl.createFramebuffer(), gl.createRenderbuffer(), gl.createTexture());

            gl.bindTexture(gl.TEXTURE_2D, target.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

            gl.bindFramebuffer(gl.FRAMEBUFFER, target.frameBuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);

            gl.bindRenderbuffer(gl.RENDERBUFFER, target.renderBuffer);

            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.renderBuffer);


            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            return target;
        }
        /**
         * Calculate the rendering surface corners
         * 
         * 
         * @memberOf World
         */
        private computeSurfaceCorners() {
            if (this.gl) {
                this.width = this.height * this.parameters.screenWidth / this.parameters.screenHeight;
                var halfWidth = this.width * 0.5, halfHeight = this.height * 0.5;

                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
                    this.centerX - halfWidth, this.centerY - halfHeight,
                    this.centerX + halfWidth, this.centerY - halfHeight,
                    this.centerX - halfWidth, this.centerY + halfHeight,
                    this.centerX + halfWidth, this.centerY - halfHeight,
                    this.centerX + halfWidth, this.centerY + halfHeight,
                    this.centerX - halfWidth, this.centerY + halfHeight]), this.gl.STATIC_DRAW);

            }
        }
        // todo: Define class
        parameters: any =
        {
            startTime: Date.now(),
            time: 0,
            mouseX: 0.5,
            mouseY: 0.5,
            screenWidth: 500,
            screenHeight: 500,
            custom: {}
        };
        renderEntities(ent: EnityBase) {

            let currentProgram = ent.currentProgram;
            let gl = this.gl;
            let buffer = this.buffer;
            if (!currentProgram) return;

            this.parameters.time = Date.now() - this.parameters.startTime;

            gl.useProgram(currentProgram);
           gl.uniform1f(currentProgram.uniformsCache['freq'], this.doAudioThingy());
            gl.uniform1f(currentProgram.uniformsCache['time'], this.parameters.time / 1000);
            gl.uniform2f(currentProgram.uniformsCache['mouse'], this.parameters.mouseX, this.parameters.mouseY);
            gl.uniform2f(currentProgram.uniformsCache['resolution'], this.parameters.screenWidth, this.parameters.screenHeight);
         
            gl.uniform2f(currentProgram.uniformsCache['surfaceSize'], this.width, this.height);

            gl.bindBuffer(gl.ARRAY_BUFFER, ent.buffer);

            gl.vertexAttribPointer(ent.positionAttribute, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
            gl.vertexAttribPointer(ent.vertexPosition, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.backTarget.texture);


            gl.bindFramebuffer(gl.FRAMEBUFFER, this.target.frameBuffer);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            this.swapBuffers();

        }

        private swapBuffers() {
            let tmp = this.target;
            this.target = this.backTarget;
            this.backTarget = tmp;
        }

    }


}