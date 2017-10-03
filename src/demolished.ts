import { Utils } from './demolishedUtils'
import { SmartArray } from './demolishedSmartArray';
import { ShaderEntity, EntityTexture, IEntity } from './demolishedEntity'
import { RenderTarget, AudioAnalyzerSettings, Uniforms, TimeFragment, Graph, Effect, Overlay, AudioSettings } from './demolishedModels'
import loadResource from './demolishedLoader'
import { DemolishedCanvas } from "./demolishedCanvas";
import { IDemolisedAudioContext } from "./demolishedSound";

export namespace Demolished {

    export class Rendering {

        gl: WebGLRenderingContext | any;

        sound: IDemolisedAudioContext;

        animationFrameCount: number;
        animationStartTime: number;
        animationFrameId: number;
        animationOffsetTime: number;
    //  audio: HTMLAudioElement;// AudioBufferSourceNode;
        entitiesCache: Array<ShaderEntity>;i
        timeFragments: Array<TimeFragment>;
        currentTimeFragment: TimeFragment;

        webGLbuffer: WebGLBuffer
        fftTexture: WebGLTexture;

        width: number = 1;
        height: number = 1;
        centerX: number = 0;
        centerY: number = 0;

        uniforms: Uniforms;

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

            renderingContext.bufferData(renderingContext.ARRAY_BUFFER, new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0]), renderingContext.STATIC_DRAW);

            return renderingContext;
        }

        loadGraph(graphFile: string): Promise<Graph> {
            return loadResource(graphFile).then((response: Response) => {
                return response.json();
            }).then((graph: Graph) => {
                return graph;
            });
        }

        constructor(public canvas: HTMLCanvasElement,
            public timelineFile: string,public audio:IDemolisedAudioContext ,public simpleCanvas?:DemolishedCanvas) {

            this.gl = this.getRendringContext();

           this.uniforms = new Uniforms(this.canvas.width, this.canvas.height);

            this.uniforms.time = 0;
            this.uniforms.timeTotal = 0;
            this.uniforms.mouseX = 0.5;
            this.uniforms.mouseY = 0.5;

            this.entitiesCache = new Array<ShaderEntity>();
            this.timeFragments = new Array<TimeFragment>();

            this.fftTexture = this.gl.createTexture();
            this.webGLbuffer = this.gl.createBuffer();

            this.addEventListeners();

            // load and add the entities
            this.loadGraph(this.timelineFile).then((graph: Graph) => {

             //   console.log(graph);

                let audioSettings: AudioSettings = graph.audioSettings;

                graph.timeline.forEach((tf: TimeFragment) => {
                    let _tf = new TimeFragment(tf.entity, tf.start, tf.stop,tf.useTransitions,tf.overlays);
                    this.timeFragments.push(_tf)
                });

                // sort the fragments by start time....
                this.timeFragments.sort((a: TimeFragment, b: TimeFragment) => {
                    return a.start - b.start;
                });
                // todo: pick audio file from graph
                // this.createAudio(audioSettings.audioFile).then((analyzer: AnalyserNode) => {

                    this.audio.createAudio(audioSettings).then((state: boolean) => {

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
                       this.resizeCanvas();
                });
            });
        }

        onFrame(frame: any): void { }
        onNext(frame: any):void {}
        onStart(): void { }
        onStop(): void { }
        onReady(): void { }

        // todo:Rename
        private addEventListeners() {

            document.addEventListener("mousemove", (evt: MouseEvent) => {
                this.uniforms.mouseX = evt.clientX / window.innerWidth;
                this.uniforms.mouseY = 1 - evt.clientY / window.innerHeight;
            });
            window.addEventListener("resize", () => {
                this.resizeCanvas();
            });
        }
        addEntity(name: string, textures: Array<EntityTexture>
        ): ShaderEntity {
            const entity = new ShaderEntity(this.gl, name, this.canvas.width, this.canvas.height, textures);

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
            if (!timeFragment) return;
            if (timeFragment.hasLayers) {

                timeFragment.overlays.forEach((overlay: Overlay) => {
                    let layer = document.createElement("div");
                    layer.id = overlay.name;
                    overlay.classList.forEach((className: string) => {
                        layer.classList.add(className);
                    });
                    layer.innerHTML = overlay.markup;

                    layer.classList.add("layer");
                    parent.appendChild(layer);
                });
            }

        
            if(timeFragment){
                this.onNext({
                d:  time - this.animationStartTime,
                c: this.animationFrameCount,
                t:  time - this.animationStartTime ,
                fps: 1000 / (time  / this.animationFrameCount)
            })
          }
          

            return timeFragment;
        }


       resetClock(time:number){
        this.uniforms.timeTotal = time;
        this.animationFrameCount = 0;
        this.animationOffsetTime = time;
        this.animationStartTime= performance.now();
        this.audio.currentTime = (time / 1000) % 60;
  
       } 

        start(time: number) {
            this.uniforms.timeTotal = time;
            this.animationFrameCount = 0;
            this.animationOffsetTime = time;

            this.currentTimeFragment = this.tryFindTimeFragment(time);
        
            this.animationStartTime = performance.now();

             this.audio.play();
            this.animate(time);
            this.audio.currentTime = (time / 1000) % 60

            
            this.onStart();

        }

        stop(): number {
            cancelAnimationFrame(this.animationFrameId);;
            this.onStop();
            return this.animationFrameId;
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


        private animate(time: number) {
            let animationTime = time - this.animationStartTime;
            this.animationFrameId = requestAnimationFrame((_time: number) => {
                this.animate(_time);
            });
            if (this.audio) {
                this.updateTextureData(
                    this.fftTexture, this.audio.textureSize, this.audio.getFrequenceData());
            }
            else{
                 this.updateTextureData(
                    this.fftTexture, this.audio.textureSize, new Uint8Array(1024));
            }
            if (this.currentTimeFragment) {
                if (animationTime >= this.currentTimeFragment.stop) {
                    this.currentTimeFragment = this.tryFindTimeFragment(time);

                }
                this.renderEntities(this.currentTimeFragment.entityShader, animationTime);
            }
            this.onFrame({
                frame: this.animationFrameCount,
                ms: animationTime,
                min: Math.floor(animationTime / 60000) % 60,
                sec: Math.floor((animationTime/1000) % 60),
                
            });
        }

        private removeLayers(parent: Element) {
            let layers = document.querySelectorAll(".layer");
            for (let i = 0; i < layers.length; i++)
                parent.removeChild(layers[i]);
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

        resizeCanvas() {

            let width = window.innerWidth / 2
            let height = window.innerHeight / 2;

            this.canvas.width = width;
            this.canvas.height = height;

            this.canvas.style.width = window.innerWidth + 'px';
            this.canvas.style.height = window.innerHeight + 'px';

            this.uniforms.screenWidth = width;
            this.uniforms.screenHeight = height;

            this.surfaceCorners();
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            let layers = document.querySelectorAll(".layer");
            for (var i = 0; i < layers.length; i++) {
                let el = layers[i] as HTMLCanvasElement;
                el.width = width;
                el.height = height;
                el.style.width = window.innerWidth + 'px';
                el.style.height = window.innerHeight + 'px'
            }
        }
      
        renderEntities(ent: IEntity, ts: number) {

            let gl = this.gl;

            this.uniforms.time = ts; 
            gl.useProgram(ent.currentProgram);

            gl.uniform1f(ent.uniformsCache.get("timeTotal"),(performance.now() - this.animationStartTime) /1000);
            gl.uniform1f(ent.uniformsCache.get('time'), this.uniforms.time / 1000);

            gl.uniform1i(ent.uniformsCache.get("frame"),this.animationFrameCount);

            gl.uniform2f(ent.uniformsCache.get('mouse'), this.uniforms.mouseX, this.uniforms.mouseY);
            gl.uniform2f(ent.uniformsCache.get('resolution'), this.uniforms.screenWidth, this.uniforms.screenHeight);

            gl.bindBuffer(gl.ARRAY_BUFFER, ent.buffer);
            gl.vertexAttribPointer(ent.positionAttribute, 2, gl.FLOAT, false, 0, 0);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.webGLbuffer);
            gl.vertexAttribPointer(ent.vertexPosition, 2, gl.FLOAT, false, 0, 0);

            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, ent.backTarget.texture);

            gl.uniform1i(gl.getUniformLocation(ent.currentProgram,"backbuffer"),1);
            gl.activeTexture(gl.TEXTURE0);

            gl.bindTexture(gl.TEXTURE_2D, this.fftTexture);

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

            this.animationFrameCount ++;
        
        }
    }
}