import { ShaderEntity } from "./src/demolishedEntity";
import { IEntityTexture } from "./src/IEntityTexture";

declare var LGraph: any;
declare var LiteGraph: any;
declare var LGraphCanvas: any;

export class RenderGraph {
    graph: any;
    randomPos = () => {
        return Math.floor((Math.random() * 400) + 1);
    }
    canvas: any;
    constructor(public shaders: Array<ShaderEntity>) {
        this.graph = new LGraph();
        this.canvas = new LGraphCanvas("#lgraph", this.graph);
    }
    draw() {
        this.shaders.forEach ( (v:ShaderEntity) => {
                this.shaderNode(v);
        });
        this.graph.start()
    }
    shaderNode = (shader: ShaderEntity) => {
        const ndShader = LiteGraph.createNode("basic/const");
        ndShader.title = shader.name;
        ndShader.pos = [this.randomPos(), this.randomPos()];
        ndShader.setValue(shader.stop);
        this.graph.add(ndShader);
        // shader.textures.forEach((texture: IEntityTexture) => {
        //     const ndTexture = LiteGraph.createNode("basic/watch");
        //             ndTexture.title = texture.name;
        //             ndTexture.pos = [this.randomPos(), this.randomPos()];
        //     this.graph.add(ndTexture);
        //         ndShader.connect(0, ndTexture, 0);
        // });
    }
    static getInstance( shaders: Array<ShaderEntity>):RenderGraph{
            return new RenderGraph(shaders);
    }
} 