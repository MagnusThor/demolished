"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EntityVideoTexture {
    constructor(data, name, width, height) {
        this.data = data;
        this.name = name;
        this.width = width;
        this.height = height;
        this.type = 1;
    }
    update(gl) {
        const level = 0;
        const internalFormat = gl.RGBA;
        const srcFormat = gl.RGBA;
        const srcType = gl.UNSIGNED_BYTE;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, this.data);
    }
}
exports.EntityVideoTexture = EntityVideoTexture;
