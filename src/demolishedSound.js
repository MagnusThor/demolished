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
var demolishedLoader_1 = require("./demolishedLoader");
var DemolishedSoundBase = (function () {
    function DemolishedSoundBase() {
    }
    return DemolishedSoundBase;
}());
exports.DemolishedSoundBase = DemolishedSoundBase;
var DemolishedSIDMusic = (function (_super) {
    __extends(DemolishedSIDMusic, _super);
    function DemolishedSIDMusic() {
        return _super.call(this) || this;
    }
    Object.defineProperty(DemolishedSIDMusic.prototype, "textureSize", {
        get: function () {
            return 16;
        },
        enumerable: true,
        configurable: true
    });
    DemolishedSIDMusic.prototype.play = function () {
        this.sid.play();
    };
    DemolishedSIDMusic.prototype.stop = function () {
        this.sid.pause();
    };
    DemolishedSIDMusic.prototype.mute = function (ismuted) {
        throw "not implemented";
    };
    DemolishedSIDMusic.prototype.getFrequenceData = function () {
        return this.sid.getFreqByteData();
    };
    Object.defineProperty(DemolishedSIDMusic.prototype, "duration", {
        get: function () {
            return 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DemolishedSIDMusic.prototype, "currentTime", {
        get: function () {
            return this.sid._currentPlaytime;
        },
        set: function (n) {
            return;
        },
        enumerable: true,
        configurable: true
    });
    DemolishedSIDMusic.prototype.createAudio = function (settings) {
        var useLess = function () { };
        var ScriptNodePlayer = window["ScriptNodePlayer"];
        var self = this;
        return new Promise(function (resolve, reject) {
            ScriptNodePlayer.createInstance(new SIDBackendAdapter(), "", [], true, useLess, function () {
                self.sid = this;
                resolve(true);
            }, useLess, useLess);
            ScriptNodePlayer.getInstance().loadMusicFromURL(settings.audioFile, {
                basePath: ""
            }, useLess, useLess);
        });
    };
    return DemolishedSIDMusic;
}(DemolishedSoundBase));
exports.DemolishedSIDMusic = DemolishedSIDMusic;
var DemolishedStreamingMusic = (function (_super) {
    __extends(DemolishedStreamingMusic, _super);
    function DemolishedStreamingMusic() {
        return _super.call(this) || this;
    }
    Object.defineProperty(DemolishedStreamingMusic.prototype, "textureSize", {
        get: function () {
            return 32;
        },
        enumerable: true,
        configurable: true
    });
    DemolishedStreamingMusic.prototype.getFrequenceData = function () {
        var bufferLength = this.audioAnalyser.frequencyBinCount;
        var freqArray = new Uint8Array(bufferLength);
        this.audioAnalyser.getByteFrequencyData(freqArray);
        return freqArray;
    };
    DemolishedStreamingMusic.prototype.play = function () {
        this.audio.play();
    };
    DemolishedStreamingMusic.prototype.stop = function () {
        this.audio.pause();
    };
    DemolishedStreamingMusic.prototype.mute = function (ismuted) {
        this.audio.muted = ismuted;
    };
    Object.defineProperty(DemolishedStreamingMusic.prototype, "duration", {
        get: function () {
            return this.audio.duration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DemolishedStreamingMusic.prototype, "currentTime", {
        get: function () {
            return this.audio.currentTime;
        },
        set: function (time) {
            this.audio.currentTime = time;
        },
        enumerable: true,
        configurable: true
    });
    DemolishedStreamingMusic.prototype.createAudio = function (audioSettings) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            demolishedLoader_1.default(audioSettings.audioFile).then(function (resp) {
                return resp.arrayBuffer().then(function (buffer) {
                    var audioCtx = new AudioContext();
                    audioCtx.decodeAudioData(buffer, function (audioData) {
                        var offlineCtx = new OfflineAudioContext(1, audioData.length, audioData.sampleRate);
                        var filteredSource = offlineCtx.createBufferSource();
                        filteredSource.buffer = audioData;
                        filteredSource.connect(offlineCtx.destination);
                        var filterOffline = offlineCtx.createBiquadFilter();
                        filterOffline.type = 'highpass';
                        filterOffline.Q.value = 2;
                        filterOffline.frequency.value = 2000;
                        filteredSource.connect(filterOffline);
                        filterOffline.connect(offlineCtx.destination);
                        filteredSource.start(0);
                        var source = audioCtx.createBufferSource();
                        source.buffer = audioData;
                        source.connect(audioCtx.destination);
                        offlineCtx.startRendering().then(function (renderedBuffer) {
                            var audioCtx = new AudioContext();
                            var audioEl = new Audio();
                            audioEl.preload = "auto";
                            audioEl.src = audioSettings.audioFile;
                            audioEl.crossOrigin = "anonymous";
                            var onLoad = function () {
                                var source = audioCtx.createMediaElementSource(audioEl);
                                var analyser = audioCtx.createAnalyser();
                                analyser.smoothingTimeConstant = audioSettings.audioAnalyzerSettings.smoothingTimeConstant;
                                analyser.fftSize = audioSettings.audioAnalyzerSettings.fftSize;
                                _this.audio = audioEl;
                                source.connect(analyser);
                                analyser.connect(audioCtx.destination);
                                _this.audioAnalyser = analyser;
                                resolve(true);
                            };
                            onLoad();
                            var bufferSource = audioCtx.createBufferSource();
                            bufferSource.buffer = renderedBuffer;
                        });
                    });
                });
            });
        });
    };
    return DemolishedStreamingMusic;
}(DemolishedSoundBase));
exports.DemolishedStreamingMusic = DemolishedStreamingMusic;
