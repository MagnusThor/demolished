"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var AudioWaveform = (function () {
    function AudioWaveform(audioBuffer, audio) {
        this.audioBuffer = audioBuffer;
        this.audio = audio;
        this.smoothing = 2;
        this.RMS = function (values) {
            return Math.sqrt(values.reduce(function (sum, value) { return sum + Math.pow(value, 2); }, 0) / values.length);
        };
        this.avg = function (values) {
            return values.reduce(function (sum, value) { return sum + value; }, 0) / values.length;
        };
        this.max = function (values) {
            return values.reduce(function (max, value) { return Math.max(max, value); }, 0);
        };
        var svg = document.querySelector('svg');
        this.progress = svg.querySelector('#progress');
        this.remaining = svg.querySelector('#remaining');
        this.width = parseInt(svg.getAttribute('width'));
        this.height = parseInt(svg.getAttribute('height'));
        var waveformData = this.getWaveformData(audioBuffer, this.width / this.smoothing);
        svg.querySelector('path').setAttribute('d', this.getSVGPath(waveformData));
        this.svg = svg;
    }
    AudioWaveform.prototype.getWaveformData = function (audioBuffer, dataPoints) {
        var leftChannel = audioBuffer.getChannelData(0);
        var rightChannel = audioBuffer.getChannelData(1);
        var values = new Float32Array(dataPoints);
        var dataWindow = Math.round(leftChannel.length / dataPoints);
        for (var i = 0, y = 0, buffer = []; i < leftChannel.length; i++) {
            var summedValue = (Math.abs(leftChannel[i]) + Math.abs(rightChannel[i])) / 2;
            buffer.push(summedValue);
            if (buffer.length === dataWindow) {
                values[y++] = this.avg(buffer);
                buffer = [];
            }
        }
        return values;
    };
    AudioWaveform.prototype.getSVGPath = function (waveformData) {
        var maxValue = this.max(waveformData);
        var path = "M 0 " + this.height + " ";
        for (var i = 0; i < waveformData.length; i++) {
            path += "L " + i * this.smoothing + " " + (1 - waveformData[i] / maxValue) * this.height + " ";
        }
        path += "V " + this.height + " H 0 Z";
        return path;
    };
    AudioWaveform.prototype.updateAudioPosition = function () {
        var _a = this.audio, currentTime = _a.currentTime, duration = _a.duration;
        var physicalPosition = (currentTime * 1000) / duration * this.width;
        if (physicalPosition) {
            this.progress.setAttribute('width', physicalPosition);
            this.remaining.setAttribute('x', physicalPosition);
            this.remaining.setAttribute('width', this.width - physicalPosition);
        }
    };
    return AudioWaveform;
}());
exports.AudioWaveform = AudioWaveform;
