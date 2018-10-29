import { Utils } from './demolishedUtils'
import { SmartArray } from './demolishedSmartArray';
import { ShaderEntity, EntityTexture, IEntity } from './demolishedEntity';
import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect, AudioSettings, IUniforms, IGraph } from './demolishedModels';
import loadResource from './demolishedLoader'
import { IDemolisedAudioContext } from "./demolishedSound";
import { DemoishedProperty, Observe } from './demolishedProperties';

export namespace Demolished {

    export class Rendering {
        onFrame(frame: any): void { }
        onNext(frame: any): void { }
        onStart(): void { }
        onStop(): void { }
        onReady(graph: IGraph): void { }
        gl: WebGLRenderingContext | any;
        webGLbuffer: WebGLBuffer
        animationFrameCount: number;
        animationStartTime: number;
        animationFrameId: number;
        animationOffsetTime: number;
        entitiesCache: Array<ShaderEntity>;
        timeFragments: Array<TimeFragment>;
        currentTimeFragment: TimeFragment;
        isPaused: boolean;
        isSoundMuted: boolean;
        fftTexture: WebGLTexture;
        width: number = 1;
        height: number = 1;
        centerX: number = 0;
        centerY: number = 0;
        resolution: number = 1;
        //@Observe(true)
        uniforms: IUniforms;

        shared: Map<string,string>;

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
            renderingContext.getExtension('OES_texture_float_linear');
            renderingContext.getExtension('OES_texture_half_float_linear');
            renderingContext.getExtension('EXT_texture_filter_anisotropic');
            renderingContext.getExtension('EXT_color_buffer_float');
            renderingContext.getExtension("WEBGL_depth_texture");
            renderingContext.getExtension("EXT_shader_texture_lod");


            this.webGLbuffer = renderingContext.createBuffer();

            renderingContext.bindBuffer(renderingContext.ARRAY_BUFFER, this.webGLbuffer);

            renderingContext.bufferData(renderingContext.ARRAY_BUFFER,
                new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]),
                renderingContext.STATIC_DRAW);

            return renderingContext;
        }

        loadGraph(graphFile: string): Promise<IGraph> {
            return loadResource(graphFile).then((response: Response) => {
                return response.json();
            }).then((graph: IGraph) => {
                return graph;
            });
        }

        private loadShared(files: Array<string>): Promise<boolean> {

            return new Promise((resolve, reject) => {
                Promise.all(files.map((f: string) => {
                    loadResource(f).then(resp => resp.text()).then(result => {

                     
                        this.shared.set(f,result + "\n") ;

                    

                    })
                })).then(() => {

                    console.log("shared", this.shared);

                    resolve(true);

                });

            });

        }

        constructor(public canvas: HTMLCanvasElement,
            public parent: Element,
            public timelineFile?: string, public audio?: IDemolisedAudioContext,
            uniforms?: IUniforms) {

            this.gl = this.getRendringContext();


            if (!uniforms) {
                this.uniforms = new Uniforms(this.canvas.width, this.canvas.height);
            } else {
                this.uniforms = uniforms;
            }

            this.entitiesCache = new Array<ShaderEntity>();
            this.timeFragments = new Array<TimeFragment>();

            this.fftTexture = this.gl.createTexture();
            this.webGLbuffer = this.gl.createBuffer();

            this.shared = new Map();

            this.addEventListeners();

            if (this.timelineFile != "") {

                this.loadGraph(this.timelineFile).then((graph: IGraph) => {

                    let audioSettings: AudioSettings = graph.audioSettings;

                    graph.timeline.forEach((tf: TimeFragment) => {
                        let _tf = new TimeFragment(tf.entity, tf.start, tf.stop, tf.subeffects);
                        this.timeFragments.push(_tf)
                    });

                    this.timeFragments.sort((a: TimeFragment, b: TimeFragment) => {
                        return a.start - b.start;
                    });

                    this.loadShared(graph.shared.glsl).then(() => {


                        this.audio.createAudio(audioSettings).then((state: boolean) => {
                            graph.effects.forEach((effect: Effect) => {
                                let textures = Promise.all(effect.textures.map((texture: any) => {
                                    return new Promise((resolve, reject) => {
                                        let image = new Image();
                                        image.src = texture.src;
                                        image.onload = () => {
                                            resolve(image);
                                        }
                                        image.onerror = (err) => resolve(err);
                                    }).then((image: HTMLImageElement) => {
                                        return new EntityTexture(image, texture.uniform, texture.width, texture.height, 0);
                                    });
                                })).then((textures: Array<EntityTexture>) => {
                                    this.addEntity(effect.name, textures);
                                    if (this.entitiesCache.length === graph.effects.length) { // todo: refactor, still 
                                        this.onReady(graph);
                                    }
                                });
                            });
                            this.resizeCanvas(this.parent);
                        });

                    });



                });
            }
        }
        // todo:Rename
        private addEventListeners() {
            document.addEventListener("mousemove", (evt: MouseEvent) => {
                this.uniforms.mouseX = evt.clientX / window.innerWidth;
                this.uniforms.mouseY = 1 - evt.clientY / window.innerHeight;
            });
        }
        getEntity(name: string): ShaderEntity {
            return this.entitiesCache.find((p: ShaderEntity) => {
                return p.name === name;
            });
        }
        addEntity(name: string, textures?: Array<EntityTexture>
        ): void {
            const entity = new ShaderEntity(this.gl, name, this.canvas.width, this.canvas.height, textures,this.shared);

          
            this.entitiesCache.push(entity);
            let tf = this.timeFragments.filter((pre: TimeFragment) => {
                return pre.entity === name;
            });
            tf.forEach((f: TimeFragment) => {
                f.setEntity(entity)
            });


        }
        private tryFindTimeFragment(time: number): TimeFragment {
            let fragment = this.timeFragments.find((tf: TimeFragment) => {
                return time < tf.stop && time >= tf.start
            });
            if (fragment) fragment.init();
            return fragment;
        }

        resetClock(time: number) {
            this.currentTimeFragment.reset();
            this.stop();
            this.start(time);
        }

        start(time: number) {
            this.uniforms.timeTotal = time;
            this.animationFrameCount = 0;
            this.animationOffsetTime = time;
            this.currentTimeFragment = this.tryFindTimeFragment(time);

            this.animationStartTime = performance.now();
            this.animate(time);

            this.audio.currentTime = (time / 1000) % 60
            this.audio.play();
            if (!this.isPaused)
                this.onStart();
        }

        stop(): number {
            this.audio.stop();
            cancelAnimationFrame(this.animationFrameId);;
            this.onStop();
            return this.animationFrameId;
        }

        mute() {
            this.isSoundMuted = !this.isSoundMuted;
            this.audio.mute(this.isSoundMuted);
        }

        pause(): number {
            if (!this.isPaused) {
                this.isPaused = true;
                this.stop();
            } else {
                this.isPaused = false;
                this.resume(this.uniforms.time);
            }

            return this.uniforms.time;
        }
        resume(time: number) {
            this.start(time);
        }
        updateTextureData(texture: WebGLTexture, size: number, bytes: Uint8Array): void {
            let gl = this.gl;
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size, size, 0, gl.RGBA, gl.UNSIGNED_BYTE, bytes);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        }
        /**
         *  animation loop
         *  todo: needs to be refactored
         * @private
         * @param {number} time 
         * @memberof Rendering
         */
        private animate(time: number) {
            let animationTime = time - this.animationStartTime;

            this.animationFrameId = requestAnimationFrame((_time: number) => this.animate(_time));
            if (this.audio) {
                this.updateTextureData(
                    this.fftTexture, this.audio.textureSize, this.audio.getFrequenceData());
            }
            else {
                this.updateTextureData(
                    this.fftTexture, this.audio.textureSize, new Uint8Array(1024));
            }

            if (this.currentTimeFragment) {
                if (animationTime >= this.currentTimeFragment.stop)
                    this.currentTimeFragment = this.tryFindTimeFragment(time);

                this.currentTimeFragment ?
                    this.renderEntities(this.currentTimeFragment.entityShader, animationTime) : this.start(0)

            }

            this.onFrame({
                frame: this.animationFrameCount,
                ms: animationTime,
                min: Math.floor(animationTime / 60000) % 60,
                sec: Math.floor((animationTime / 1000) % 60),

            });
        }

        private surfaceCorners() {
            if (this.gl) {
                this.width = this.height * this.uniforms.screenWidth / this.uniforms.screenHeight;
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


        resizeCanvas(parent: Element, resolution?: number) {

            if (resolution) this.resolution = resolution;

            let width = parent.clientWidth / this.resolution;
            let height = parent.clientHeight / this.resolution;

            this.canvas.width = width;
            this.canvas.height = height;

            this.canvas.style.width = parent.clientWidth + 'px';
            this.canvas.style.height = parent.clientHeight + 'px';

            this.uniforms.screenWidth = width;
            this.uniforms.screenHeight = height;

            this.surfaceCorners();

            this.setViewPort(this.canvas.width, this.canvas.height);

        }

        getCurrentUniforms(): Map<string, WebGLUniformLocation> {
            return this.currentTimeFragment.entityShader.uniformsCache;
        }
        private updateUniforms() {
            throw "Not yet implemented";
        }
        renderEntities(ent: IEntity, ts: number) {
            this.uniforms.time = ts;
            this.uniforms.timeTotal = (performance.now() - this.animationStartTime);
            this.gl.useProgram(ent.glProgram);
            ent.render(this);
            this.animationFrameCount++;
        }
        addTexture(ent: IEntity, entityTexture: EntityTexture) {
            ent.textures.push(entityTexture);
        }
        bindTexture(ent: IEntity, entityTexture: EntityTexture, c: number) {
            let gl = this.gl;
            gl.activeTexture(gl.TEXTURE0 + (2 + c));
            gl.bindTexture(gl.TEXTURE_2D, entityTexture.texture);
            gl.uniform1i(gl.getUniformLocation(ent.glProgram, entityTexture.name), 2 + c);
        }

    }
}