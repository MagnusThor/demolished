import { IEntityTexture } from "./IEntityTexture";
export class EntityVideoTexture implements IEntityTexture {
    texture: WebGLTexture;
    assetType: number;
    update(gl) {
        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, this.data);
    }
    constructor(public data: any, public name: string, public width: number, public height: number) {
        this.assetType = 1;
    }
}
