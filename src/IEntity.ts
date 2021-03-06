import { RenderTarget } from './demolishedModels';
import { Uniforms } from "./Uniforms";
import { Demolished } from './demolished';
import { IEntityTexture } from "./IEntityTexture";
import { TextureBinding } from "./TextureBinding";
export interface IEntity {
    render(engine: Demolished.Rendering): void;
    onError(err: any): void;
    swapBuffers(): void;
    glProgram: WebGLProgram;
    textures?: Array<TextureBinding>;
    mainBuffer: WebGLBuffer;
    vertexPosition: number;
    positionAttribute: number;
    target: RenderTarget;
    backTarget: RenderTarget;
    frameId: number;
    uniforms: Uniforms;
}
