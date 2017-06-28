"use strict";
;
var RenderTarget = (function () {
    function RenderTarget(frameBuffer, renderBuffer, texture) {
        this.frameBuffer = frameBuffer;
        this.renderBuffer = renderBuffer;
        this.texture = texture;
    }
    return RenderTarget;
}());
exports.RenderTarget = RenderTarget;
/**
 *
 *
 * @export
 * @class Graph
 */
var Graph = (function () {
    function Graph() {
    }
    return Graph;
}());
exports.Graph = Graph;
/**
 *
 *
 * @export
 * @class TimeFragment
 */
var TimeFragment = (function () {
    function TimeFragment(entity, start, stop, css3Layers) {
        this.entity = entity;
        this.start = start;
        this.stop = stop;
        if (css3Layers instanceof Array) {
            this.css3Layers = css3Layers;
        }
        else
            this.css3Layers = new Array();
    }
    TimeFragment.prototype.setEntity = function (ent) {
        this.entityShader = ent;
    };
    Object.defineProperty(TimeFragment.prototype, "hasLayers", {
        get: function () {
            return this.css3Layers.length > 0;
        },
        enumerable: true,
        configurable: true
    });
    return TimeFragment;
}());
exports.TimeFragment = TimeFragment;
var CSS3Layer = (function () {
    function CSS3Layer(name, classList) {
        this.name = name;
        this.classList = classList;
    }
    return CSS3Layer;
}());
exports.CSS3Layer = CSS3Layer;
/**
 * Uniforms are global variables  passed to the shaders program's
 *
 * @export
 * @class Uniforms
 */
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
/**
 *
 *
 * @export
 * @class Effect
 */
var Effect = (function () {
    function Effect() {
        this.textures = new Array();
        this.type = 0;
    }
    return Effect;
}());
exports.Effect = Effect;
/**
 *
 *
 * @export
 * @class AudioAnalyzerSettings
 */
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
/**
 *
 *
 * @export
 * @class AudioSettings
 */
var AudioSettings = (function () {
    function AudioSettings() {
    }
    return AudioSettings;
}());
exports.AudioSettings = AudioSettings;
//  "audioSettings": {
//     "audioFile": "song.mp3",
//     "audioAnalyzerSettings":{
//         "fftSize": 8192,
//         "smoothingTimeConstant": 0.85,
//         "minDecibels": -100,
//         "maxDecibels":-30
//     },
//     "duration": 211200,
//     "bmp": 129
// } 
