import { Utils } from './demolishedUtils'
import { SmartArray } from './demolishedSmartArray';
import { EnityBase, EntityTexture } from './demolishedEntity'
import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect, CSS3Layer, AudioSettings } from './demolishedModels'

export namespace Demolished {

    export class Rendering {

        gl: WebGLRenderingContext | any;

        animationStartTime: number;
        animationFrameId: number;
        animationOffsetTime: number;

        audio: HTMLAudioElement;// AudioBufferSourceNode;

        entitiesCache: Array<EnityBase>;
        timeFragments: Array<TimeFragment>;
        currentTimeFragment: TimeFragment;

        webGLbuffer: WebGLBuffer
        fftTexture: WebGLTexture;

        width: number = 1;
        height: number = 1;
        centerX: number = 0;
        centerY: number = 0;

        parameters: Uniforms;


        audioAnalyser: AnalyserNode
        peaks: Array<any>;

        private getRendringContext(): WebGLRenderingContext {

            let renderingContext: any;
            let contextAttributes = {
                preserveDrawingBuffer: true
            };

            renderingContext =
                this.canvas.getContext('webgl2', contextAttributes) ||
                this.canvas.getContext('webgl', contextAttributes) ||
                this.canvas.getContext('experimental-webgl', contextAttributes);

            renderingContext.getExtension('OES_standard_derivatives');
            renderingContext.getExtension("OES_texture_float");
            renderingContext.getExtension("OES_texture_half_float");
            renderingContext.getExtension("OES_texture_half_float_linear");
            renderingContext.getExtension("WEBGL_draw_buffers");
            renderingContext.getExtension("WEBGL_depth_texture");
            renderingContext.getExtension("EXT_shader_texture_lod");
            renderingContext.getExtension("EXT_texture_filter_anisotropic");

            this.webGLbuffer = renderingContext.createBuffer();

            renderingContext.bindBuffer(renderingContext.ARRAY_BUFFER, this.webGLbuffer);

            renderingContext.bufferData(renderingContext.ARRAY_BUFFER, new Float32Array(
                [-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]
            ), renderingContext.STATIC_DRAW);

            return renderingContext;
        }

        loadGraph(graphFile: string): Promise<Graph> {
            return fetch(graphFile).then((response: Response) => {
                return response.json();
            }).then((graph: Graph) => {
                return graph;
            })
        }

        constructor(public canvas: HTMLCanvasElement,
            public timelineFile: string,
        ) {
            this.parameters = new Uniforms(this.canvas.width, this.canvas.height);

            this.parameters.time = 0;
            this.parameters.mouseX = 0.5;
            this.parameters.mouseY = 0.5;

            this.entitiesCache = new Array<EnityBase>();
            this.timeFragments = new Array<TimeFragment>();

            this.gl = this.getRendringContext();

            this.fftTexture = this.gl.createTexture();
            this.webGLbuffer = this.gl.createBuffer();

            this.addEventListeners()

            // load and add the entities
            this.loadGraph(this.timelineFile).then((graph: Graph) => {

                console.log(graph);

                let audioSettings: AudioSettings = graph.audioSettings;
                
                graph.timeline.forEach((tf: TimeFragment) => {

                
                    let _tf = new TimeFragment(tf.entity, tf.start, tf.stop, tf.css3Layers);
                    this.timeFragments.push(_tf)
                });

                // sort the fragments by start time....
                this.timeFragments.sort((a: TimeFragment, b: TimeFragment) => {
                    return a.start - b.start;
                });
                // todo: pick audio file from graph
                this.createAudio(audioSettings.audioFile).then((analyzer: AnalyserNode) => {

                    this.audioAnalyser = analyzer;
                    this.audioAnalyser.smoothingTimeConstant = audioSettings.audioAnalyzerSettings.smoothingTimeConstant;
                    this.audioAnalyser.fftSize = audioSettings.audioAnalyzerSettings.fftSize
                    this.audioAnalyser.maxDecibels = audioSettings.audioAnalyzerSettings.minDecibels;
                    this.audioAnalyser.minDecibels = audioSettings.audioAnalyzerSettings.maxDecibels;

                    graph.effects.forEach((effect: Effect) => {

                        let textures = Promise.all(effect.textures.map((texture: any) => {
                            return new Promise((resolve, reject) => {
                                let image = new Image();
                                image.src = texture.url;
                                image.onload = () => {
                                    resolve(image);
                                }
                                image.onerror = (err) => resolve(err);
                            }).then((image: HTMLImageElement) => {
                                return new EntityTexture(image, texture.uniform, texture.width, texture.height, 0);
                            });

                        })).then((assets: Array<EntityTexture>) => {
                            this.addEntity(effect.name, assets);

                            if (this.entitiesCache.length === graph.effects.length) { // todo: refactor, still
                                this.onReady();
                                this.resizeCanvas();
                            }
                        });
                    });
                 //   this.resizeCanvas();
                });
            });
        }

        onFrame(frame: any): void { }
        onStart(): void { }
        onStop(): void { }
        onReady(): void { }

        // todo:Rename
        getAudioTracks(): any {


            // let ms = this.audio["captureStream"](60)
            // return ms.getAudioTracks();
        }



        createAudio(src: string): Promise<AnalyserNode> {
            return new Promise((resolve, reject) => {
                fetch(src).then((resp: Response) => {
                    return resp.arrayBuffer().then((buffer: ArrayBuffer) => {
                        let audioCtx = new AudioContext();
                        audioCtx.decodeAudioData(buffer, (audioData: AudioBuffer) => {
                            let offlineCtx = new OfflineAudioContext(1, audioData.length, audioData.sampleRate);


                            var filteredSource = offlineCtx.createBufferSource();
                            filteredSource.buffer = audioData;                    // tell the source which sound to play
                            filteredSource.connect(offlineCtx.destination);       // connect the source to the context's destination (the speakers)

                            var filterOffline = offlineCtx.createBiquadFilter();
                            filterOffline.type = 'highpass';
                            filterOffline.Q.value = 2;
                            filterOffline.frequency.value = 2000;

                            // Pipe the song into the filter, and the filter into the offline context
                            filteredSource.connect(filterOffline);
                            filterOffline.connect(offlineCtx.destination);

                            filteredSource.start(0);

                            let source = audioCtx.createBufferSource(); // creates a sound source
                            source.buffer = audioData;                    // tell the source which sound to play
                            source.connect(audioCtx.destination);       // connect the source to the context's destination (the speakers)

                            offlineCtx.startRendering().then((renderedBuffer: AudioBuffer) => {
                                let audioCtx = new AudioContext();


                                let audioEl = new Audio(); //document.createElement("audio");
                                audioEl.preload = "auto";
                                audioEl.src = "/assets/song.mp3";
                                audioEl.crossOrigin = "anonymous"

                                const onLoad = () => {
                                    let source = audioCtx.createMediaElementSource(audioEl);
                                    let analyser = audioCtx.createAnalyser();

                                    this.audio = audioEl;

                                    source.connect(analyser);
                                    analyser.connect(audioCtx.destination);
                                    resolve(analyser)


                                    window.addEventListener("load", onLoad, false);
                                };
                                onLoad();

                                let bufferSource = audioCtx.createBufferSource();
                                bufferSource.buffer = renderedBuffer;
                                let analyser = audioCtx.createAnalyser();
                                //  analyser.connect(audioCtx.destination);
                                // bufferSource.connect(analyser);
                                // bufferSource.connect(audioCtx.destination);
                                //  this.audio = bufferSource;

                                this.peaks = Utils.Audio.getPeaksAtThreshold(renderedBuffer.getChannelData(0),
                                    audioData.sampleRate, 0.21);

                                this.parameters.bpm = (Utils.Array.average(Utils.Array.delta(this.peaks)) / audioData.sampleRate) * 1000;



                            });
                        });
                    });
                });
            });
        }
        private addEventListeners() {

            document.addEventListener("mousemove", (evt: MouseEvent) => {
                this.parameters.mouseX = evt.clientX / window.innerWidth;
                this.parameters.mouseY = 1 - evt.clientY / window.innerHeight;
            });
            window.addEventListener("resize", () => {
                this.resizeCanvas();
            });
        }
        addEntity(name: string, textures: Array<EntityTexture>
        ): EnityBase {
            const entity = new EnityBase(this.gl, name, this.canvas.width, this.canvas.height, textures);

            this.entitiesCache.push(entity);
            // attach to timeLine
            let tf = this.timeFragments.filter((pre: TimeFragment) => {
                return pre.entity === name;
            });

            tf.forEach((f: TimeFragment) => {
                f.setEntity(entity)
            });

            return entity;
        }



        private tryFindTimeFragment(time: number): TimeFragment {
            let parent = document.querySelector("#main");
            this.removeLayers(parent);
            let timeFragment = this.timeFragments.find((tf: TimeFragment) => {
                return time < tf.stop && time >= tf.start
            });
            if (timeFragment.hasLayers) {

                timeFragment.css3Layers.forEach((cssLayer: CSS3Layer) => {
                    let layer = document.createElement("div");
                    layer.id = cssLayer.name;

                    cssLayer.classList.forEach ( (className:string) => {
                            layer.classList.add(className);
                    });

                    layer.innerHTML = cssLayer.markup;
                
                    layer.classList.add("layer");
                    parent.appendChild(layer);
                });
            }


            return timeFragment;
        }

        start(time: number) {
            this.animationOffsetTime = time;

            this.currentTimeFragment = this.tryFindTimeFragment(time);

            this.animationStartTime = performance.now();

            this.animate(time);
            this.audio.currentTime = (time / 1000) % 60

            this.audio.play();
            this.onStart();

        }

        autoCorrelateFloat(buf: Float32Array, sampleRate: number) {
            var MIN_SAMPLES = 4;	// corresponds to an 11kHz signal
            var MAX_SAMPLES = 1000; // corresponds to a 44Hz signal
            var SIZE = 1000;
            var best_offset = -1;
            var best_correlation = 0;
            var rms = 0;
            if (buf.length < (SIZE + MAX_SAMPLES - MIN_SAMPLES))
                return -1;  // Not enough data
            for (var i = 0; i < SIZE; i++)
                rms += buf[i] * buf[i];
            rms = Math.sqrt(rms / SIZE);
            for (var offset = MIN_SAMPLES; offset <= MAX_SAMPLES; offset++) {
                var correlation = 0;
                for (var i = 0; i < SIZE; i++) {
                    correlation += Math.abs(buf[i] - buf[i + offset]);
                }
                correlation = 1 - (correlation / SIZE);
                if (correlation > best_correlation) {
                    best_correlation = correlation;
                    best_offset = offset;
                }
            }
            if ((rms > 0.1) && (best_correlation > 0.1)) {

                //     console.log("f = " + sampleRate / best_offset + "Hz (rms: " + rms + " confidence: " + best_correlation + ")");
                return sampleRate / best_offset;
            } else return -1;
            //   return sampleRate/best_offset;
        }


        stop(): number {
            cancelAnimationFrame(this.animationFrameId);;
            this.onStop();
            return this.animationFrameId;
        }

        updateTextureData(texture: WebGLTexture, width: number, height: number, bytes: Uint8Array): void {
            let gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 32, 32, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

        }


        private animate(time: number) {
            let animationTime = time - this.animationStartTime;
            this.animationFrameId = requestAnimationFrame((_time: number) => {
                this.animate(_time);
            });

            if (this.audioAnalyser) {
                let bufferLength = this.audioAnalyser.frequencyBinCount;

                let freqArray = new Uint8Array(bufferLength);
                this.audioAnalyser.getByteFrequencyData(freqArray);
                this.updateTextureData(
                    this.fftTexture, 32, 32, freqArray);
                this.parameters.freq = Utils.Array.average(freqArray);
                // for debug-purpose
                var fEl = document.querySelector("#freq");
                fEl.textContent = Math.round(this.parameters.freq).toString();
            }

            // todo: Make this Entities an Map<EntityBase>
            //  let entity: EnityBase = this.entities[this.currentEntity];

            // if(!entity) throw "Could not find the entity " + this.currentEntity;

            if (animationTime >= this.currentTimeFragment.stop) {
                this.currentTimeFragment = this.tryFindTimeFragment(time);

                // is there css3 layers / 2d canvas elemets to set up?


            }
            this.renderEntities(this.currentTimeFragment.entityShader, animationTime);
        }

        private removeLayers(parent: Element) {
            let layers = document.querySelectorAll(".layer");
            console.log("removing nodes ->", layers.length);
            for (let i = 0; i < layers.length; i++)
                parent.removeChild(layers[i]);



        }

        private surfaceCorners() {
            if (this.gl) {
                this.width = this.height * this.parameters.screenWidth / this.parameters.screenHeight;
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.webGLbuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
                    this.centerX - this.width, this.centerY - this.height,
                    this.centerX + this.width, this.centerY - this.height,
                    this.centerX - this.width, this.centerY + this.height,
                    this.centerX + this.width, this.centerY - this.height,
                    this.centerX + this.width, this.centerY + this.height,
                    this.centerX - this.width, this.centerY + this.height
                ]), this.gl.STATIC_DRAW);
            }
        }

        setViewPort(width: number, height: number) {
            this.gl.viewport(0, 0, width, height);
        }

        resizeCanvas() {

            let width = window.innerWidth / 2
            let height = window.innerHeight / 2;

            this.canvas.width = width;
            this.canvas.height = height;

            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';

            this.parameters.screenWidth = width;
            this.parameters.screenHeight = height;

            this.surfaceCorners();

            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

            let layers = document.querySelectorAll(".layer");
            for (var i = 0; i < layers.length; i++) {
                //console.log(layers[i]);
                let el = layers[i] as HTMLCanvasElement;
                el.width = width;
                el.height = height;
                el.style.width = window.innerWidth + 'px';
                el.style.height = window.innerHeight + 'px'
            }
        }


        renderEntities(ent: EnityBase, ts: number) {

            let gl = this.gl;

            this.parameters.time = ts; // Date.now() - this.parameters.startTime;

            gl.useProgram(ent.currentProgram);

            gl.uniform1f(ent.uniformsCache.get('bpm'), this.parameters.bpm);
            gl.uniform1f(ent.uniformsCache.get("freq"), this.parameters.freq);

            gl.uniform1f(ent.uniformsCache.get('time'), this.parameters.time / 1000);
            gl.uniform2f(ent.uniformsCache.get('mouse'), this.parameters.mouseX, this.parameters.mouseY);
            gl.uniform2f(ent.uniformsCache.get('resolution'), this.parameters.screenWidth, this.parameters.screenHeight);

            gl.bindBuffer(gl.ARRAY_BUFFER, ent.buffer);
            gl.vertexAttribPointer(ent.positionAttribute, 2, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGLbuffer);
            gl.vertexAttribPointer(ent.vertexPosition, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, ent.backTarget.texture);

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.fftTexture);

            // Should be fftSampler
            gl.uniform1i(gl.getUniformLocation(ent.currentProgram, "fft"), 0);

            let offset = 2;
            ent.assets.forEach((asset: EntityTexture, index: number) => {
                gl.activeTexture(gl.TEXTURE0 + (offset + index));
                gl.bindTexture(gl.TEXTURE_2D, asset.texture);
                gl.uniform1i(gl.getUniformLocation(ent.currentProgram, asset.name), offset + index);
            });

            gl.bindFramebuffer(gl.FRAMEBUFFER, ent.target.frameBuffer);

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 6);

            ent.swapBuffers();

            this.onFrame({
                ts: this.animationOffsetTime + ts,
                raflId: this.animationFrameId
            });

        }
    }
}