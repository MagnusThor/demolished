"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const demolishedModels_1 = require("./demolishedModels");
const demolishedUtils_1 = require("./demolishedUtils");
const index_1 = require("../index");
let _highestZ = 100000;
class Timeline {
    constructor(containerId, totalTime) {
        this.Segments = new Array();
        this.containerId = containerId;
    }
    createSegment(title, start, end, updateCallback) {
        let segment = new Segment(title, start, end, this.containerId, updateCallback);
        this.Segments.push(segment);
        return segment;
    }
    multiline() {
        var _allSegments = demolishedUtils_1.Utils.$$(".segment");
        for (var i = 0; i < _allSegments.length; i++) {
            _allSegments[i].style.top = i * _allSegments[i].clientHeight + "px";
        }
    }
    singleline() {
        var _allSegments = demolishedUtils_1.Utils.$$("segment");
        for (var i = 0; i < _allSegments.length; i++) {
            _allSegments[i].style.top = "0px";
        }
    }
    get totalTime() {
        return this.Segments.reduce((x, y) => {
            return x.start + y.start;
        }, 0);
    }
}
exports.Timeline = Timeline;
class Segment extends demolishedModels_1.TimeFragment {
    constructor(title, start, end, containerId, updateCallback) {
        super(title, start, end);
        this.title = title;
        this.start = start;
        this.end = end;
        this.containerId = containerId;
        this.updateCallback = updateCallback;
        this.container = demolishedUtils_1.Utils.$(containerId);
        let _segmentElement = demolishedUtils_1.Utils.el("div");
        _segmentElement.classList.add("segment");
        let _leftDragElement = demolishedUtils_1.Utils.el("div");
        _leftDragElement.setAttribute("class", "segment-left-handle");
        let _centerDragElement = demolishedUtils_1.Utils.el("div");
        _centerDragElement.classList.add("segment-center-handle");
        let _rightDragElement = demolishedUtils_1.Utils.el("div");
        _rightDragElement.classList.add("segment-right-handle");
        _segmentElement.appendChild(_rightDragElement);
        _segmentElement.appendChild(_centerDragElement);
        _segmentElement.appendChild(_leftDragElement);
        let _segmentTitleElement = demolishedUtils_1.Utils.el("span", this.title);
        _segmentTitleElement.classList.add("segment-details");
        _centerDragElement.appendChild(_segmentTitleElement);
        this.hostElement = _segmentElement;
        this.hostElement.style.backgroundColor = this.getRandomColor();
        this.container.appendChild(this.hostElement);
        let _dragging = false;
        let _resizingLeft = false;
        let _resizingRight = false;
        let _lastX;
        let _lastLeftX;
        let _lastRightX;
        _segmentElement.onmousedown = (ev) => {
            _dragging = true;
            _lastX = ev.clientX;
            _highestZ += 10;
            _segmentElement.style.zIndex = _highestZ.toString();
        };
        _leftDragElement.addEventListener("mousedown", (ev) => {
            _resizingLeft = true;
            _lastLeftX = ev.clientX;
            _highestZ += 10;
            ev.stopPropagation();
        });
        _leftDragElement.addEventListener("mouseup", (ev) => {
            _resizingLeft = false;
        });
        _rightDragElement.addEventListener("mousedown", (ev) => {
            _resizingRight = true;
            _lastRightX = ev.clientX;
            _highestZ += 10;
            ev.stopPropagation();
        });
        _rightDragElement.addEventListener("mouseup", (ev) => {
            _resizingRight = false;
        });
        this.container.addEventListener("mousemove", (ev) => {
            if (_dragging) {
                _segmentElement.style.left = (_segmentElement.offsetLeft - (_lastX - ev.clientX)).toString() + "px";
                _lastX = ev.clientX;
            }
            if (_resizingLeft) {
                _segmentElement.style.width = (_segmentElement.offsetWidth + (_lastLeftX - ev.clientX)).toString() + "px";
                _segmentElement.style.left = (_segmentElement.offsetLeft - (_lastLeftX - ev.clientX)).toString() + "px";
                _lastLeftX = ev.clientX;
            }
            if (_resizingRight) {
                _segmentElement.style.width = (_segmentElement.offsetWidth - (_lastRightX - ev.clientX)).toString() + "px";
                _lastRightX = ev.clientX;
            }
        });
        this.container.addEventListener("mouseup", (ev) => {
            _dragging = false;
            _resizingLeft = false;
            _resizingRight = false;
        });
        _segmentElement.addEventListener("mouseup", (ev) => {
            _dragging = false;
            _resizingLeft = false;
            _resizingRight = false;
            this.updateInfo();
        });
        this.init();
    }
    scaleToFit(v) {
        return (this.containerWidth / 6250200) * v;
    }
    scaleToGraph(v) {
        let d = v / (this.containerWidth / 6250200);
        return d;
    }
    get length() {
        let l = this.scaleToFit(this.end - this.start);
        return l;
    }
    get containerWidth() {
        return this.container.clientWidth;
    }
    init() {
        this.hostElement.style.width = this.length.toString();
        this.hostElement.style.left = this.scaleToFit(this.start).toString();
    }
    updateInfo() {
        let x = Math.ceil(this.scaleToGraph(parseInt(this.hostElement.style.left)));
        let w = Math.ceil(this.scaleToGraph(parseInt(this.hostElement.style.width)));
        x < 0 ? x = 0 : x = x;
        let evt = {
            name: this.title,
            start: x,
            stop: x + w,
            length: w,
        };
        index_1.DemolishedEd.showJSON(evt, demolishedUtils_1.Utils.$(".dlg-timeline"));
        if (this.updateCallback)
            this.updateCallback(evt);
    }
    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}
exports.Segment = Segment;
