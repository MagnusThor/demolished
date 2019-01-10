"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var demolishedModels_1 = require("./demolishedModels");
var demolishedLoader_1 = require("./demolishedLoader");
var demolishedUtils_1 = require("./demolishedUtils");
var AudioSettings = (function () {
    function AudioSettings() {
    }
    return AudioSettings;
}());
exports.AudioSettings = AudioSettings;
var EntityTexture = (function () {
    function EntityTexture(image, name, width, height, assetType) {
        this.image = image;
        this.name = name;
        this.width = width;
        this.height = height;
        this.assetType = assetType;
    }
    return EntityTexture;
}());
exports.EntityTexture = EntityTexture;
var EntityBase = (function () {
    function EntityBase(gl) {
        this.gl = gl;
        this.actions = new Map();
    }
    EntityBase.prototype.cacheUniformLocation = function (label) {
        this.uniformsCache.set(label, this.gl.getUniformLocation(this.glProgram, label));
    };
    return EntityBase;
}());
exports.EntityBase = EntityBase;
var ShaderEntity = (function (_super) {
    __extends(ShaderEntity, _super);
    function ShaderEntity(gl, name, w, h, textures, shared) {
        var _this = _super.call(this, gl) || this;
        _this.gl = gl;
        _this.name = name;
        _this.w = w;
        _this.h = h;
        _this.textures = textures;
        _this.shared = shared;
        _this.uniformsCache = new Map();
        _this.loadShaders().then(function (numOfShaders) {
            if (numOfShaders > -1) {
                _this.setupShader();
                _this.target = _this.createRenderTarget(_this.w, _this.h);
                _this.backTarget = _this.createRenderTarget(_this.w, _this.h);
            }
        });
        return _this;
    }
    ShaderEntity.prototype.addBuffer = function (key) {
        throw "Not yet implemented";
    };
    ShaderEntity.prototype.render = function (engine) {
        var gl = this.gl;
        var ent = this;
        gl.uniform1f(ent.uniformsCache.get('time'), engine.uniforms.time / 1000.);
        gl.uniform1f(ent.uniformsCache.get("timetotal"), engine.uniforms.timeTotal / 1000.);
        gl.uniform4fv(ent.uniformsCache.get("datetime"), engine.uniforms.datetime);
        gl.uniform1f(ent.uniformsCache.get("playbacktime"), engine.audio.currentTime);
        gl.uniform1i(ent.uniformsCache.get("frameId"), engine.animationFrameCount);
        gl.uniform1i(ent.uniformsCache.get("subEffectId"), ent.subEffectId);
        gl.uniform2f(ent.uniformsCache.get("mouse"), engine.uniforms.mouseX, engine.uniforms.mouseY);
        gl.uniform2f(ent.uniformsCache.get("resolution"), engine.uniforms.screenWidth, engine.uniforms.screenHeight);
        gl.bindBuffer(gl.ARRAY_BUFFER, ent.mainBuffer);
        gl.vertexAttribPointer(ent.positionAttribute, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, engine.webGLbuffer);
        gl.vertexAttribPointer(ent.vertexPosition, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, ent.backTarget.texture);
        gl.uniform1i(gl.getUniformLocation(ent.glProgram, "backbuffer"), 1);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, engine.fftTexture);
        gl.uniform1i(gl.getUniformLocation(ent.glProgram, "fft"), 0);
        ent.textures.forEach(function (asset, index) {
            engine.bindTexture(ent, asset, index);
        });
        gl.bindFramebuffer(gl.FRAMEBUFFER, ent.target.frameBuffer);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        ent.swapBuffers();
    };
    ShaderEntity.prototype.addAction = function (key, fn) {
        this.actions.set(key, fn);
    };
    ShaderEntity.prototype.runAction = function (key, tm) {
        try {
            this.actions.get(key)(this, tm);
        }
        catch (_a) {
            console.warn(this);
        }
    };
    ShaderEntity.prototype.removeAction = function (key) {
        return this.actions.delete(key);
    };
    ShaderEntity.prototype.reset = function () {
        throw "not yet implemented";
    };
    ShaderEntity.prototype.createRenderTarget = function (width, height) {
        var gl = this.gl;
        var target = new demolishedModels_1.RenderTarget(gl.createFramebuffer(), gl.createRenderbuffer(), gl.createTexture());
        gl.bindTexture(gl.TEXTURE_2D, target.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindFramebuffer(gl.FRAMEBUFFER, target.frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, target.texture, 0);
        gl.bindRenderbuffer(gl.RENDERBUFFER, target.renderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, target.renderBuffer);
        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        return target;
    };
    ShaderEntity.prototype.loadShaders = function () {
        var _this = this;
        var urls = new Array();
        urls.push("entities/shaders/" + this.name + "/fragment.glsl");
        urls.push("entities/shaders/" + this.name + "/vertex.glsl");
        return Promise.all(urls.map(function (url) {
            return demolishedLoader_1.default(url).then(function (resp) { return resp.text(); });
        })).then(function (result) {
            _this.fragmentShader = result[0];
            _this.vertexShader = result[1];
            return urls.length;
        }).catch(function (reason) {
            _this.onError(reason);
            return -1;
        });
    };
    ShaderEntity.prototype.setFragment = function (fs) {
        this.fragmentShader = fs;
        this.setupShader();
    };
    ShaderEntity.prototype.onSuccess = function (shader) {
    };
    ShaderEntity.prototype.onError = function (err) {
    };
    ShaderEntity.prototype.createTextureFromImage = function (width, height, image) {
        var gl = this.gl;
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    };
    ShaderEntity.prototype.setupShader = function () {
        var _this = this;
        var gl = this.gl;
        this.mainBuffer = gl.createBuffer();
        this.glProgram = gl.createProgram();
        var vs = this.createShader(gl, demolishedUtils_1.ShaderCompiler.vertexHeader +
            demolishedUtils_1.ShaderCompiler.parseIncludes(this.vertexShader, this.shared), gl.VERTEX_SHADER);
        var fs = this.createShader(gl, demolishedUtils_1.ShaderCompiler.fragmentHeader +
            demolishedUtils_1.ShaderCompiler.parseIncludes(this.fragmentShader, this.shared), gl.FRAGMENT_SHADER);
        gl.attachShader(this.glProgram, vs);
        gl.attachShader(this.glProgram, fs);
        gl.linkProgram(this.glProgram);
        this.cacheUniformLocation('fft');
        this.cacheUniformLocation("subEffectId");
        this.cacheUniformLocation("playbacktime");
        this.cacheUniformLocation('time');
        this.cacheUniformLocation("datetime");
        this.cacheUniformLocation('frameId');
        this.cacheUniformLocation("timetotal");
        this.cacheUniformLocation('mouse');
        this.cacheUniformLocation('resolution');
        this.cacheUniformLocation("backbuffer");
        this.subEffectId = 0;
        this.frameId = 0;
        this.positionAttribute = 0;
        gl.enableVertexAttribArray(this.positionAttribute);
        this.vertexPosition = gl.getAttribLocation(this.glProgram, "pos");
        gl.enableVertexAttribArray(this.vertexPosition);
        this.textures.forEach(function (asset) {
            asset.texture = _this.createTextureFromImage(asset.width, asset.height, asset.image);
        });
        gl.useProgram(this.glProgram);
    };
    ShaderEntity.prototype.swapBuffers = function () {
        var tmp = this.target;
        this.target = this.backTarget;
        this.backTarget = tmp;
    };
    ShaderEntity.prototype.createShader = function (gl, src, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if (!success) {
            this.onError(gl.getShaderInfoLog(shader));
        }
        else {
            this.onSuccess(shader);
        }
        return shader;
    };
    return ShaderEntity;
}(EntityBase));
exports.ShaderEntity = ShaderEntity;
