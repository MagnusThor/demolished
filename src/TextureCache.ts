import { IEntityTexture } from "./IEntityTexture";
export class TextureCache {
    entity: Map<string, IEntityTexture>;
    add(t: IEntityTexture): void {
        this.entity.set(t.name, t);
    }
    get(k: string): IEntityTexture {
        return this.entity.get(k);
    }
    constructor() {
        this.entity = new Map<string, IEntityTexture>();
    }
}
