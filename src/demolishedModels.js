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
    function TimeFragment(entity, start, stop, useTransitions) {
        this.entity = entity;
        this.start = start;
        this.stop = stop;
        this.useTransitions = useTransitions;
    }
    TimeFragment.prototype.setEntity = function (ent) {
        this.entityShader = ent;
        if (this.useTransitions) {
            this.transition = new demolishedTransitions_1.DemlolishedTransitionBase(this.entityShader);
        }
    };
    return TimeFragment;
}());
exports.TimeFragment = TimeFragment;
var Uniforms = (function () {
    function Uniforms(width, height) {
        this.screenWidth = width;
        this.screenHeight = height;
        this.alpha = 0;
        this.time = 0;
        this.timeTotal = 0;
        this.mouseX = 0.5;
        this.mouseY = 0.5;
    }
    Object.defineProperty(Uniforms.prototype, "datetime", {
        get: function () {
            var d = new Date();
            return [d.getFullYear(), d.getMonth(), d.getDate(),
                d.getHours() * 60.0 * 60 + d.getMinutes() * 60 + d.getSeconds() + d.getMilliseconds() / 1000.0];
        },
        enumerable: true,
        configurable: true
    });
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
