"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
;
class RenderTarget {
    constructor(frameBuffer, renderBuffer, texture) {
        this.frameBuffer = frameBuffer;
        this.renderBuffer = renderBuffer;
        this.texture = texture;
    }
}
exports.RenderTarget = RenderTarget;
class TimeFragment {
    constructor(entity, start, stop, subeffects) {
        this.entity = entity;
        this.start = start;
        this.stop = stop;
        subeffects ? this.subeffects = subeffects : this.subeffects = new Array();
        this._subeffects = this.subeffects.map((a) => { return a; });
    }
    reset() {
        this.subeffects = this._subeffects.map((a) => { return a; });
    }
}
exports.TimeFragment = TimeFragment;
class Effect {
    constructor(start, stop) {
        this.textures = new Array();
        this.type = 0;
        this.start = start;
        this.stop = stop;
    }
}
exports.Effect = Effect;
class AudioAnalyzerSettings {
    constructor(fftSize, smoothingTimeConstant, minDecibels, maxDecibels) {
        this.fftSize = fftSize;
        this.smoothingTimeConstant = smoothingTimeConstant;
        this.minDecibels = minDecibels;
        this.maxDecibels = maxDecibels;
    }
}
exports.AudioAnalyzerSettings = AudioAnalyzerSettings;
class AudioSettings {
    constructor(audioAnalyzerSettings, duration, bpm) {
        this.audioAnalyzerSettings = audioAnalyzerSettings;
        this.bpm = bpm;
        this.audioFile;
        this.duration = duration;
    }
}
exports.AudioSettings = AudioSettings;
