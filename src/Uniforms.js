"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Pipleline_1 = require("./Pipleline");
class UniformsBase {
    constructor(gl, program) {
        this.gl = gl;
        this.program = program;
        this.GLType = [
            {
                ut: -1,
                mi: 'N',
                un: 'bool'
            },
            {
                ut: 5126,
                mi: 'f',
                un: 'float'
            },
            {
                ut: -1,
                mi: 'i',
                un: 'float'
            },
            {
                ut: 35664,
                mi: 'f',
                un: 'vec2'
            },
            {
                ut: -1,
                mi: 'f',
                un: 'vec3'
            },
            {
                ut: -1,
                mi: 'f',
                un: 'vec4'
            },
            {
                ut: -1,
                mi: 'updateTexture',
                un: 'sampler2D'
            },
        ];
        this.uniformCache = new Map();
        this.activeUniforms = this.runtimeUniforms();
    }
    findType(gltype) {
        return this.GLType.find((pre) => pre.ut == gltype);
    }
    runtimeUniforms() {
        let numUniforms = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_UNIFORMS);
        const result = [];
        for (let i = 0; i < numUniforms; ++i) {
            let info = this.gl.getActiveUniform(this.program, i);
            if (info) {
                result.push({
                    type: info.type,
                    name: info.name
                });
            }
        }
        return result;
    }
    cacheUniformLocation(label) {
        this.uniformCache.set(label, this.gl.getUniformLocation(this.program, label));
        return this;
    }
    location(key) {
        return this.uniformCache.get(key.toString());
    }
    mapType(value, au) {
        let prefix = "uniform";
        let mi = "", dt = this.findType(au.type), s = "1";
        let args = [];
        if (!Array.isArray(value)) {
            args.push(value);
        }
        else
            args = value;
        s = args.length.toString();
        mi = prefix + s + dt.mi;
        return {
            mi,
            args
        };
    }
    createPipleline() {
        this.handler = new Pipleline_1.PiplelineHandler();
        return new Proxy(new Uniforms(this.gl, this.program), this.handler);
    }
}
exports.UniformsBase = UniformsBase;
class Uniforms extends UniformsBase {
    constructor(gl, program) {
        super(gl, program);
        this.program = program;
        this.textureIndex = 2;
        this.time = 0;
        this.timeTotal = 0;
        this.mouse = [0.5, 0.5];
        this.resolution = [gl.canvas.width, gl.canvas.height];
        this.textures = new Map();
    }
    get datetime() {
        let d = new Date();
        return [d.getFullYear(), d.getMonth(), d.getDate(),
            d.getHours() * 60.0 * 60 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000.0];
    }
    get screenWidth() {
        return this.resolution[0];
    }
    get screenHeight() {
        return this.resolution[1];
    }
    setScreen(w, h) {
        this.resolution = [w, h];
    }
    bindTexture(key) {
    }
}
exports.Uniforms = Uniforms;
