import { IEntityTexture } from "./IEntityTexture";
export class EntityTexture implements IEntityTexture {
    src: string;
    texture: WebGLTexture;
    type: number;
    constructor(public data: any, public name: string, public width: number, public height: number) {
        this.type = 0;
    }
    update(gl): void {
    }
}
