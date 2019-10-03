import { IEntityTexture } from "./IEntityTexture";
export class EntityTexture implements IEntityTexture {
    texture: WebGLTexture;
    assetType: number;
    constructor(public data: any, public name: string, public width: number, public height: number) {
        this.assetType = 0;
    }
    update(gl): void {
    }
}
