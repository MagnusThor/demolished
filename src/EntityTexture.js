"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EntityTexture {
    constructor(data, name, width, height) {
        this.data = data;
        this.name = name;
        this.width = width;
        this.height = height;
        this.assetType = 0;
    }
    update(gl) {
    }
}
exports.EntityTexture = EntityTexture;
