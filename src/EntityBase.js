"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EntityBase {
    constructor(gl) {
        this.gl = gl;
    }
    getUniformValues() {
        throw "not implemented";
    }
}
exports.EntityBase = EntityBase;
