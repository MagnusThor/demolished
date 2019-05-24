"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AudioWaveform {
    constructor(audioBuffer, audio) {
        this.audioBuffer = audioBuffer;
        this.audio = audio;
        this.smoothing = 2;
        this.RMS = values => {
            return Math.sqrt(values.reduce((sum, value) => sum + Math.pow(value, 2), 0) / values.length);
        };
        this.avg = values => {
            return values.reduce((sum, value) => sum + value, 0) / values.length;
        };
        this.max = values => {
            return values.reduce((max, value) => Math.max(max, value), 0);
        };
        let svg = document.querySelector('svg');
        this.progress = svg.querySelector('#progress');
        this.remaining = svg.querySelector('#remaining');
        this.width = parseInt(svg.getAttribute('width'));
        this.height = parseInt(svg.getAttribute('height'));
        const waveformData = this.getWaveformData(audioBuffer, this.width / this.smoothing);
        svg.querySelector('path').setAttribute('d', this.getSVGPath(waveformData));
        this.svg = svg;
    }
    getWaveformData(audioBuffer, dataPoints) {
        const leftChannel = audioBuffer.getChannelData(0);
        const rightChannel = audioBuffer.getChannelData(1);
        const values = new Float32Array(dataPoints);
        const dataWindow = Math.round(leftChannel.length / dataPoints);
        for (let i = 0, y = 0, buffer = []; i < leftChannel.length; i++) {
            const summedValue = (Math.abs(leftChannel[i]) + Math.abs(rightChannel[i])) / 2;
            buffer.push(summedValue);
            if (buffer.length === dataWindow) {
                values[y++] = this.avg(buffer);
                buffer = [];
            }
        }
        return values;
    }
    getSVGPath(waveformData) {
        const maxValue = this.max(waveformData);
        let path = `M 0 ${this.height} `;
        for (let i = 0; i < waveformData.length; i++) {
            path += `L ${i * this.smoothing} ${(1 - waveformData[i] / maxValue) * this.height} `;
        }
        path += `V ${this.height} H 0 Z`;
        return path;
    }
    updateAudioPosition() {
        const { currentTime, duration } = this.audio;
        const physicalPosition = (currentTime) / duration * this.width;
        if (physicalPosition) {
            this.progress.setAttribute('width', physicalPosition);
            this.remaining.setAttribute('x', physicalPosition);
            this.remaining.setAttribute('width', this.width - physicalPosition);
        }
    }
}
exports.AudioWaveform = AudioWaveform;
