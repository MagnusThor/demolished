"use strict";
var DemolishedRecorder = (function () {
    function DemolishedRecorder(videoTrack, audioTrack) {
        var _this = this;
        this.videoTrack = videoTrack;
        this.audioTrack = audioTrack;
        this.mediaStream = new MediaStream([videoTrack, audioTrack]);
        this.recorder = new MediaRecorder(this.mediaStream, {
            mimeType: 'video/webm;codecs=vp9' });
        this.recorder.ondataavailable = function (e) { return _this.data.push(e.data); };
    }
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
