"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class TextureCache {
    add(t) {
        this.entity.set(t.name, t);
    }
    get(k) {
        return this.entity.get(k);
    }
    constructor() {
        this.entity = new Map();
    }
}
exports.TextureCache = TextureCache;
