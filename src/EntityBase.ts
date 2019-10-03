import { Uniforms } from "./Uniforms";
/**
 *
 *
 * @export
 * @class EntityBase
 */
export class EntityBase {
    uniforms: Uniforms;
    glProgram: WebGLProgram;
    constructor(public gl: WebGLRenderingContext) {
    }
    getUniformValues(): Array<any> {
        throw "not implemented";
    }
}
