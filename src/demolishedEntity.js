"use strict";
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
    function EntityBase(gl, name, x, y, assets) {
        var _this = this;
        this.gl = gl;
        this.name = name;
        this.x = x;
        this.y = y;
        this.assets = assets;
        this.uniformsCache = new Map();
        this.loadEntityShaders().then(function () {
            _this.initShader();
            _this.target = _this.createRenderTarget(_this.x, _this.y);
            _this.backTarget = _this.createRenderTarget(_this.x, _this.y);
        });
    }
    EntityBase.prototype.createRenderTarget = function (width, height) {
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
    EntityBase.prototype.loadEntityShaders = function () {
        var _this = this;
        var urls = new Array();
        urls.push("entities/" + this.name + "/fragment.glsl");
        urls.push("entities/" + this.name + "/vertex.glsl");
        return Promise.all(urls.map(function (url) {
            return demolishedLoader_1.default(url).then(function (resp) { return resp.text(); });
        })).then(function (result) {
            _this.fragmetShader = result[0];
            _this.vertexShader = result[1];
            return true;
        }).catch(function (reason) {
            _this.onError(reason);
            return false;
        });
    };
    EntityBase.prototype.onError = function (err) {
        console.error(err);
    };
    EntityBase.prototype.createTextureFromData = function (width, height, image) {
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
    EntityBase.prototype.initShader = function () {
        var _this = this;
        var gl = this.gl;
        this.buffer = gl.createBuffer();
        this.currentProgram = gl.createProgram();
        var vs = this.createShader(gl, this.vertexShader, gl.VERTEX_SHADER);
        var fs = this.createShader(gl, this.fragmetShader, gl.FRAGMENT_SHADER);
        gl.attachShader(this.currentProgram, vs);
        gl.attachShader(this.currentProgram, fs);
        gl.linkProgram(this.currentProgram);
        if (!gl.getProgramParameter(this.currentProgram, gl.LINK_STATUS)) {
            var info = gl.getProgramInfoLog(this.currentProgram);
            this.onError(info);
        }
        this.cacheUniformLocation('bpm');
        this.cacheUniformLocation('freq');
        this.cacheUniformLocation("sampleRate");
        this.cacheUniformLocation("fft");
        this.cacheUniformLocation('time');
        this.cacheUniformLocation("elapsedTime");
        this.cacheUniformLocation('mouse');
        this.cacheUniformLocation('resolution');
        this.cacheUniformLocation("backbuffer");
        this.positionAttribute = 0;
        gl.enableVertexAttribArray(this.positionAttribute);
        this.vertexPosition = gl.getAttribLocation(this.currentProgram, "position");
        gl.enableVertexAttribArray(this.vertexPosition);
        this.assets.forEach(function (asset) {
            switch (asset.assetType) {
                case 0:
                    asset.texture = _this.createTextureFromData(asset.width, asset.height, asset.image);
                    break;
                case 1:
                    break;
                default:
                    throw "unknown asset type";
            }
        });
        gl.useProgram(this.currentProgram);
    };
    EntityBase.prototype.cacheUniformLocation = function (label) {
        this.uniformsCache.set(label, this.gl.getUniformLocation(this.currentProgram, label));
    };
    EntityBase.prototype.swapBuffers = function () {
        var tmp = this.target;
        this.target = this.backTarget;
        this.backTarget = tmp;
    };
    EntityBase.prototype.createShader = function (gl, src, type) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);
        return shader;
    };
    return EntityBase;
}());
exports.EntityBase = EntityBase;
