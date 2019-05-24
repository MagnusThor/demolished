"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DemolishedRecorder {
    constructor(videoTrack, audioTrack) {
        this.videoTrack = videoTrack;
        this.audioTrack = audioTrack;
        this.mediaStream = new MediaStream([videoTrack, audioTrack]);
        this.recorder = new MediaRecorder(this.mediaStream, {
            mimeType: 'video/webm;codecs=vp9'
        });
        this.recorder.ondataavailable = (e) => {
            if (e.data.size > 0)
                this.data.push(e.data);
        };
    }
    toBlob() {
        let blob = new Blob(this.data, {
            type: 'video/webm'
        });
        return URL.createObjectURL(blob);
    }
    flush(r) {
        return new Promise((resolve, reject) => {
            r == resolve(this.toBlob());
            this.data = new Array();
        });
    }
    stop() {
        this.recorder.stop();
    }
    start(n) {
        this.data = new Array();
        this.recorder.start(n);
    }
}
exports.DemolishedRecorder = DemolishedRecorder;
