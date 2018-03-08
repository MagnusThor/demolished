"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
;
var demolishedTransitions_1 = require("./demolishedTransitions");
var demolishedProperties_1 = require("./demolishedProperties");
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
    }
    Uniforms.prototype.setScreen = function (w, h) {
        this.screenWidth = w;
        this.screenWidth = h;
    };
    __decorate([
        demolishedProperties_1.Observe(true),
        __metadata("design:type", Number)
    ], Uniforms.prototype, "time", void 0);
    __decorate([
        demolishedProperties_1.Observe(true),
        __metadata("design:type", Number)
    ], Uniforms.prototype, "timeTotal", void 0);
    __decorate([
        demolishedProperties_1.Observe(true),
        __metadata("design:type", Number)
    ], Uniforms.prototype, "mouseX", void 0);
    __decorate([
        demolishedProperties_1.Observe(true),
        __metadata("design:type", Number)
    ], Uniforms.prototype, "mouseY", void 0);
    __decorate([
        demolishedProperties_1.Observe(true),
        __metadata("design:type", Number)
    ], Uniforms.prototype, "screenWidth", void 0);
    __decorate([
        demolishedProperties_1.Observe(true),
        __metadata("design:type", Number)
    ], Uniforms.prototype, "screenHeight", void 0);
    __decorate([
        demolishedProperties_1.Observe(true),
        __metadata("design:type", Number)
    ], Uniforms.prototype, "alpha", void 0);
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
