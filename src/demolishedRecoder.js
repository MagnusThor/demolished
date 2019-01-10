"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DemolishedRecorder = (function () {
    function DemolishedRecorder(videoTrack, audioTrack) {
        var _this = this;
        this.videoTrack = videoTrack;
        this.audioTrack = audioTrack;
        this.mediaStream = new MediaStream([videoTrack, audioTrack]);
        this.recorder = new MediaRecorder(this.mediaStream, {
            mimeType: 'video/webm;codecs=vp9'
        });
        this.recorder.ondataavailable = function (e) {
            if (e.data.size > 0)
                _this.data.push(e.data);
        };
    }
    DemolishedRecorder.prototype.toBlob = function () {
        var blob = new Blob(this.data, {
            type: 'video/webm'
        });
        return URL.createObjectURL(blob);
    };
    DemolishedRecorder.prototype.flush = function (r) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            r == resolve(_this.toBlob());
            _this.data = new Array();
        });
    };
    DemolishedRecorder.prototype.stop = function () {
        this.recorder.stop();
    };
    DemolishedRecorder.prototype.start = function (n) {
        this.data = new Array();
        this.recorder.start(n);
    };
    return DemolishedRecorder;
}());
exports.DemolishedRecorder = DemolishedRecorder;
