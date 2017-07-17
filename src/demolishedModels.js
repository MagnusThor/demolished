"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
var demolishedTransitions_1 = require("./demolishedTransitions");
var RenderTarget = (function () {
    function RenderTarget(frameBuffer, renderBuffer, texture) {
        this.frameBuffer = frameBuffer;
        this.renderBuffer = renderBuffer;
        this.texture = texture;
    }
    return RenderTarget;
}());
exports.RenderTarget = RenderTarget;
var Graph = (function () {
    function Graph() {
    }
    return Graph;
}());
exports.Graph = Graph;
var TimeFragment = (function () {
    function TimeFragment(entity, start, stop, useTransitions, overlays) {
        this.entity = entity;
        this.start = start;
        this.stop = stop;
        this.useTransitions = useTransitions;
        if (overlays instanceof Array) {
            this.overlays = overlays;
        }
        else
            this.overlays = new Array();
    }
    TimeFragment.prototype.setEntity = function (ent) {
        this.entityShader = ent;
        if (this.useTransitions) {
            this.transition = new demolishedTransitions_1.DemloshedTransitionBase(this.entityShader);
        }
    };
    Object.defineProperty(TimeFragment.prototype, "hasLayers", {
        get: function () {
            return this.overlays.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    return TimeFragment;
}());
exports.TimeFragment = TimeFragment;
var Overlay = (function () {
    function Overlay(name, classList) {
        this.name = name;
        this.classList = classList;
    }
    return Overlay;
}());
exports.Overlay = Overlay;
var Uniforms = (function () {
    function Uniforms(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
    }
    Uniforms.prototype.setScreen = function (w, h) {
        this.screenWidth = w;
        this.screenWidth = h;
    };
    return Uniforms;
}());
exports.Uniforms = Uniforms;
var Effect = (function () {
    function Effect() {
        this.textures = new Array();
        this.type = 0;
    }
    return Effect;
}());
exports.Effect = Effect;
var AudioAnalyzerSettings = (function () {
    function AudioAnalyzerSettings(fftSize, smoothingTimeConstant, minDecibels, maxDecibels) {
        this.fftSize = fftSize;
        this.smoothingTimeConstant = smoothingTimeConstant;
        this.minDecibels = minDecibels;
        this.maxDecibels = maxDecibels;
    }
    return AudioAnalyzerSettings;
}());
exports.AudioAnalyzerSettings = AudioAnalyzerSettings;
var AudioSettings = (function () {
    function AudioSettings() {
    }
    return AudioSettings;
}());
exports.AudioSettings = AudioSettings;
