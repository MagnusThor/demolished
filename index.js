"use strict";
var demolished_1 = require('./src/demolished');
var demolishedRecorder_1 = require('./src/demolishedRecorder');
var DemolishedSequencer = (function () {
    function DemolishedSequencer() {
        var _this = this;
        this.duration = 312600;
        this.timeLine = document.querySelector(".demolished-timeline input");
        this.timeLine.addEventListener("mousedown", function (evt) {
            _this.world.stop();
        });
        this.timeLine.addEventListener("mouseup", function (evt) {
            var ms = parseInt(evt.target.value);
            var s = (ms / 1000) % 60;
            _this.world.audio.currentTime = s;
            _this.world.audio.play();
            _this.world.start(ms);
        });
        this.timeLine.addEventListener("change", function (evt) {
        });
        var analyzerSettings = new demolished_1.Demolished.AudioAnalyzerSettings(8192, 0.85, -100, -30);
        var canvas = document.querySelector("#gl");
        window.onerror = function () {
            _this.world.stop();
        };
        this.world = new demolished_1.Demolished.World(canvas, "entities/timeline.json", analyzerSettings);
        this.world.onReady = function () {
            var arr = _this.world.entities.map(function (a, index) {
                return {
                    d: a.stop - a.start, i: index };
            });
            _this.getTimeLineDetails(arr);
            _this.timeLine.setAttribute("max", _this.duration.toString());
            _this.onReady();
        };
        this.world.onStart = function () {
            var p = document.querySelector("#record-canvas");
            if (p.checked) {
                var videoStream = _this.world.canvas["captureStream"](60);
                var videoTrack = videoStream.getVideoTracks()[0];
                var audioTrack = _this.world.getAudioTracks()[0];
                _this.recorder = new demolishedRecorder_1.DemolishedRecorder(videoTrack, audioTrack);
                _this.recorder.start(100);
            }
        };
        this.world.onFrame = function (frame) {
            var t = frame.ts;
            document.querySelector("#time").textContent =
                ((t / 1000) / 60).toFixed(0).toString() + ":" +
                    ((t / 1000) % 60).toFixed(2).toString();
            if (!_this.pauseUi)
                _this.timeLine.value = frame.ts.toString();
        };
        this.world.onStop = function () {
            if (_this.recorder) {
                var recorderNode = document.querySelector("#recording");
                _this.recorder.stop();
                var blob = new Blob(_this.recorder.data, {
                    type: 'video/webm'
                });
                var url = window.URL.createObjectURL(blob);
                var downloadlink = document.createElement('a');
                downloadlink.textContent = "download recording";
                downloadlink.href = url;
                recorderNode.classList.remove("hide");
                recorderNode.appendChild(downloadlink);
            }
        };
    }
    DemolishedSequencer.prototype.onReady = function () { };
    DemolishedSequencer.prototype.getTimeLineDetails = function (arr) {
        var _this = this;
        var parent = document.querySelector(".demolished-timeline");
        var ox = 0;
        arr.forEach(function (ent, index) {
            var el = document.createElement("div");
            el.classList.add("timeline-entry");
            var d = (parseInt(ent.d) / _this.duration);
            var w = 100 * (Math.round(100 * (d * 1)) / 100);
            el.style.width = w + "%";
            el.style.left = ox + "%";
            el.style.background = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
            parent.appendChild(el);
            ox += w;
        });
    };
    return DemolishedSequencer;
}());
exports.DemolishedSequencer = DemolishedSequencer;
document.addEventListener("DOMContentLoaded", function () {
    var launchButton = document.querySelector("#full-screen");
    function launchFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    var demolished = new DemolishedSequencer();
    window["demo"] = demolished;
    demolished.onReady = function () {
        launchButton.textContent = "Start";
        launchButton.disabled = false;
    };
    launchButton.addEventListener("click", function () {
        launchButton.classList.add("hide");
        demolished.world.start(location.hash == "" ? 0 : parseInt(location.hash.substring(1)));
    });
});
