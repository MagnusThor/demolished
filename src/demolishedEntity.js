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
    function ShaderEntity(gl, name, w, h, textures) {
        var _this = _super.call(this, gl) || this;
        _this.gl = gl;
        _this.name = name;
        _this.w = w;
        _this.h = h;
        _this.textures = textures;
        _this.uniformsCache = new Map();
        _this.loadShaders().then(function () {
            _this.initShader();
            _this.target = _this.createRenderTarget(_this.w, _this.h);
            _this.backTarget = _this.createRenderTarget(_this.w, _this.h);
        });
        return _this;
    }
    ShaderEntity.prototype.render = function () {
        throw "Not yet implemented";
    };
    ShaderEntity.prototype.addAction = function (key, fn) {
        this.actions.set(key, fn);
    };
    ShaderEntity.prototype.runAction = function (key, tm) {
        this.actions.get(key)(this, tm);
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
        urls.push("entities/" + this.name + "/fragment.glsl");
        urls.push("entities/" + this.name + "/vertex.glsl");
        return Promise.all(urls.map(function (url) {
            return demolishedLoader_1.default(url).then(function (resp) { return resp.text(); });
        })).then(function (result) {
            _this.fragmentShader = result[0];
            _this.vertexShader = result[1];
            return true;
        }).catch(function (reason) {
            _this.onError(reason);
            return false;
        });
    };
    ShaderEntity.prototype.compile = function (fs, vs) {
        if (vs) {
            this.vertexShader = vs;
        }
        this.fragmentShader = fs;
        this.initShader();
    };
    ShaderEntity.prototype.onError = function (err) {
        console.error(err);
    };
    ShaderEntity.prototype.createTextureFromData = function (width, height, image) {
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
    ShaderEntity.prototype.initShader = function () {
        var _this = this;
        var gl = this.gl;
        this.buffer = gl.createBuffer();
        this.glProgram = gl.createProgram();
        var vs = this.createShader(gl, this.vertexShader, gl.VERTEX_SHADER);
        var fs = this.createShader(gl, this.fragmentShader, gl.FRAGMENT_SHADER);
        gl.attachShader(this.glProgram, vs);
        gl.attachShader(this.glProgram, fs);
        gl.linkProgram(this.glProgram);
        if (!gl.getProgramParameter(this.glProgram, gl.LINK_STATUS)) {
            var info = gl.getProgramInfoLog(this.glProgram);
            var error = gl.getProgramParameter(this.glProgram, gl.VALIDATE_STATUS);
            this.onError(info);
        }
        this.cacheUniformLocation('fft');
        this.cacheUniformLocation('time');
        this.cacheUniformLocation("datetime");
        this.cacheUniformLocation('frameId');
        this.cacheUniformLocation("timeTotal");
        this.cacheUniformLocation('mouse');
        this.cacheUniformLocation('resolution');
        this.cacheUniformLocation("subEffectId");
        this.cacheUniformLocation("backbuffer");
        this.subEffectId = 0;
        this.frameId = 0;
        this.positionAttribute = 0;
        gl.enableVertexAttribArray(this.positionAttribute);
        this.vertexPosition = gl.getAttribLocation(this.glProgram, "position");
        gl.enableVertexAttribArray(this.vertexPosition);
        this.textures.forEach(function (asset) {
            asset.texture = _this.createTextureFromData(asset.width, asset.height, asset.image);
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
        return shader;
    };
    return ShaderEntity;
}(EntityBase));
exports.ShaderEntity = ShaderEntity;
