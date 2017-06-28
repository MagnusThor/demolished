"use strict";
var demolished_1 = require('./src/demolished');
var DemolishedSequencer = (function () {
    function DemolishedSequencer() {
        var _this = this;
        document.addEventListener("keydown", function (evt) {
            console.log("time & freq ", _this.rendering.parameters.time, _this.rendering.parameters.freq);
        });
        this.totalDuration = 249600;
        this.timeLine = document.querySelector(".demolished-timeline input");
        this.timeLine.addEventListener("mousedown", function (evt) {
            _this.rendering.stop();
        });
        this.timeLine.addEventListener("mouseup", function (evt) {
            var ms = parseInt(evt.target.value);
            var s = (ms / 1000) % 60;
            _this.rendering.audio.pause();
            _this.rendering.start(ms);
        });
        this.timeLine.addEventListener("change", function (evt) {
        });
        var canvas = document.querySelector("#gl");
        window.onerror = function () {
            _this.rendering.stop();
        };
        this.rendering = new demolished_1.Demolished.Rendering(canvas, "entities/graph.json");
        this.rendering.onReady = function () {
            var details = _this.rendering.timeFragments.map(function (a, index) {
                return {
                    duration: a.stop - a.start, index: index, description: "foo", name: a.entity };
            });
            _this.getTimeLineDetails(details);
            _this.timeLine.setAttribute("max", _this.totalDuration.toString());
            _this.onReady();
        };
        this.rendering.onStart = function () {
            var p = document.querySelector("#record-canvas");
            if (p.checked) {
                // let videoStream = this.world.canvas["captureStream"](60) as MediaStream;
                // let videoTrack = videoStream.getVideoTracks()[0];
                // let audioTrack = this.world.getAudioTracks()[0];
                // this.recorder = new DemolishedRecorder(videoTrack, audioTrack);
                // this.recorder.start(100);
                console.error("needs to be fixed");
            }
        };
        this.rendering.onFrame = function (frame) {
            var t = frame.ts;
            document.querySelector("#time").textContent =
                ((t / 1000) / 60).toFixed(0).toString() + ":" +
                    ((t / 1000) % 60).toFixed(2).toString();
            if (!_this.pauseUi)
                _this.timeLine.value = frame.ts.toString();
        };
        this.rendering.onStop = function () {
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
            var d = (parseInt(ent.duration) / _this.totalDuration);
            var w = 100 * (Math.round(100 * (d * 1)) / 100);
            el.style.width = w + "%";
            el.style.left = ox + "%";
            el.style.background = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
            var callout = document.createElement("div");
            callout.classList.add("timeline-callout", "hide");
            callout.textContent = ent.name;
            el.addEventListener("mouseenter", function () {
                callout.classList.remove("hide");
            });
            el.addEventListener("mouseleave", function () {
                callout.classList.add("hide");
            });
            el.appendChild(callout);
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
        demolished.rendering.start(location.hash == "" ? 0 : parseInt(location.hash.substring(1)));
    });
});
