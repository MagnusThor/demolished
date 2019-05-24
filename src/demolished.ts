import { ShaderEntity, EntityTexture, IEntity, IEntityTexture } from './demolishedEntity';
import { IGraph } from './demolishedModels';
import { Graph } from "./Graph";
import { IDemolisedAudioContext } from "./demolishedSound";
import { DemolishedConfig } from './demolishedConfig';

export namespace Demolished {

    export class Rendering {
        graph: IGraph;
        onFrame(a:any): void { }
        onNext(a:any): void { }
        onStart(): void { }
        onStop(): void { }
        onReady(): void { }

        gl: WebGLRenderingContext | any;
        webGLbuffer: WebGLBuffer
        animationFrameCount: number;
        animationStartTime: number;
        animationFrameId: number;
        animationOffsetTime: number;
        entitiesCache: Array<ShaderEntity>;
        shaderEntity: ShaderEntity;
        isPaused: boolean;
        isSoundMuted: boolean;
        fftTexture: WebGLTexture;
       
        width: number = 1;
        height: number = 1;
        centerX: number = 0;
        centerY: number = 0;
       
        resolution: number = 1;
       
        shared: Map<string,string>;

        isPlaybackMode : boolean


        config: DemolishedConfig;

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
        get duration():number{
                return this.graph.duration;
        }

        constructor(public canvas: HTMLCanvasElement,
            public parent: Element,
            public timelineFile?: string, public audio?: IDemolisedAudioContext) {
                
            this.gl = this.getRendringContext();

            this.entitiesCache = new Array<ShaderEntity>();
            
            this.fftTexture = this.gl.createTexture();
            this.webGLbuffer = this.gl.createBuffer();

            Graph.Load(this.timelineFile,this).then( (g:Graph) => {

                   
                    this.resizeCanvas(this.parent);
                    this.onReady();
                  
            });
           
        }
        getEntity(name: string): ShaderEntity {
            return this.entitiesCache.find((p: ShaderEntity) => {
                return p.name === name;
            });
        }
        addEntity(name: string, textures?: Array<EntityTexture>): ShaderEntity {
            const entity = new ShaderEntity(this.gl, name, 
                this.canvas.width, this.canvas.height, textures,this.shared,this); 
            this.entitiesCache.push(entity);
            return entity;
        }        
        /**
         * Get the nextEntity from timeline if not i playback mode
         *
         * @param {*} time
         * @returns {ShaderEntity}
         * ndering
         */
        public nextEntity():ShaderEntity{
            if(!this.isPlaybackMode){
            return this.entitiesCache.find( (a:ShaderEntity) => {
                    return  a.name === "hemi";
            });
            }else{
                throw "Playmode not implemented"
            }            
        }

        resetClock(time: number) {
        
            this.shaderEntity.uniforms.time = 0;
            this.shaderEntity.uniforms.timeTotal = 0;
            this.audio.currentTime  = 0;
        }

        start(time: number) {
         
            this.animationFrameCount = 0;
            this.animationOffsetTime = time;
            this.shaderEntity = this.nextEntity();
        //    this.currentTimeFragment.init();
           // this.currentTimeFragment.uniforms.timeTotal = time;
        
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
                this.resume(this.shaderEntity.uniforms.time);
            }
            return this.shaderEntity.uniforms.time;           
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
       
            if (this.shaderEntity) {
              
                this.shaderEntity ?
                    this.renderEntities(this.shaderEntity, animationTime) : this.start(0)

            }

            this.onFrame({
                id: this.animationFrameId,
                c: this.animationFrameCount,
            });
        }

        private surfaceCorners(sw:number,sh:number) {
            if (this.gl) {
                this.width = this.height * sw / sh;
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
            
            this.surfaceCorners(width,height);

            this.setViewPort(this.canvas.width, this.canvas.height);

        }
        renderEntities(ent: IEntity, ts: number) {        
           this.shaderEntity.uniforms.time = ts;
            this.shaderEntity.uniforms.timeTotal = (performance.now() - this.animationStartTime);
            this.gl.useProgram(ent.glProgram);
            ent.render(this);
            this.animationFrameCount++;
        }
        addTexture(ent: IEntity, entityTexture: EntityTexture) {
            ent.textures.push(entityTexture);
        }
        bindTexture(ent: IEntity, entityTexture: IEntityTexture, c: number) {
            let gl = this.gl;
            gl.activeTexture(gl.TEXTURE0 + (1 + c));
            gl.bindTexture(gl.TEXTURE_2D, entityTexture.texture);
            gl.uniform1i(gl.getUniformLocation(ent.glProgram, entityTexture.name), 1 + c);
            if(entityTexture.assetType ==1)
            entityTexture.update(this.gl);

        }

    }
}