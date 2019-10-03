"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RenderGraph {
    constructor(shaders) {
        this.shaders = shaders;
        this.randomPos = () => {
            return Math.floor((Math.random() * 400) + 1);
        };
        this.shaderNode = (shader) => {
            const ndShader = LiteGraph.createNode("basic/const");
            ndShader.title = shader.name;
            ndShader.pos = [this.randomPos(), this.randomPos()];
            ndShader.setValue(shader.stop);
            this.graph.add(ndShader);
            shader.textures.forEach((texture) => {
                const ndTexture = LiteGraph.createNode("basic/watch");
                ndTexture.title = texture.name;
                ndTexture.pos = [this.randomPos(), this.randomPos()];
                this.graph.add(ndTexture);
                ndShader.connect(0, ndTexture, 0);
            });
        };
        this.graph = new LGraph();
        this.canvas = new LGraphCanvas("#lgraph", this.graph);
    }
    draw() {
        this.shaders.forEach((v) => {
            this.shaderNode(v);
        });
        this.graph.start();
    }
    static getInstance(shaders) {
        return new RenderGraph(shaders);
    }
}
exports.RenderGraph = RenderGraph;
