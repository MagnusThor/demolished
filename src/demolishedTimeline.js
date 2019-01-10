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
var demolishedModels_1 = require("./demolishedModels");
var demolishedUtils_1 = require("./demolishedUtils");
var index_1 = require("../index");
var _highestZ = 100000;
var Timeline = (function () {
    function Timeline(containerId, totalTime) {
        this.Segments = new Array();
        this.containerId = containerId;
    }
    Timeline.prototype.createSegment = function (title, start, end, updateCallback) {
        var segment = new Segment(title, start, end, this.containerId, updateCallback);
        this.Segments.push(segment);
        return segment;
    };
    Timeline.prototype.multiline = function () {
        var _allSegments = document.getElementsByClassName("segment");
        for (var i = 0; i < _allSegments.length; i++) {
            _allSegments[i].style.top = i * _allSegments[i].clientHeight + "px";
        }
    };
    Timeline.prototype.singleline = function () {
        var _allSegments = document.getElementsByClassName("segment");
        for (var i = 0; i < _allSegments.length; i++) {
            _allSegments[i].style.top = "0px";
        }
    };
    Object.defineProperty(Timeline.prototype, "totalTime", {
        get: function () {
            return this.Segments.reduce(function (x, y) {
                return x.start + y.start;
            }, 0);
        },
        enumerable: true,
        configurable: true
    });
    return Timeline;
}());
exports.Timeline = Timeline;
var Segment = (function (_super) {
    __extends(Segment, _super);
    function Segment(title, start, end, containerId, updateCallback) {
        var _this = _super.call(this, title, start, end) || this;
        _this.title = title;
        _this.start = start;
        _this.end = end;
        _this.containerId = containerId;
        _this.updateCallback = updateCallback;
        _this.container = demolishedUtils_1.Utils.$(containerId);
        var _segmentElement = demolishedUtils_1.Utils.el("div");
        _segmentElement.classList.add("segment");
        var _leftDragElement = demolishedUtils_1.Utils.el("div");
        _leftDragElement.setAttribute("class", "segment-left-handle");
        var _centerDragElement = demolishedUtils_1.Utils.el("div");
        _centerDragElement.classList.add("segment-center-handle");
        var _rightDragElement = demolishedUtils_1.Utils.el("div");
        _rightDragElement.classList.add("segment-right-handle");
        _segmentElement.appendChild(_rightDragElement);
        _segmentElement.appendChild(_centerDragElement);
        _segmentElement.appendChild(_leftDragElement);
        var _segmentTitleElement = demolishedUtils_1.Utils.el("span", _this.title);
        _segmentTitleElement.classList.add("segment-details");
        _centerDragElement.appendChild(_segmentTitleElement);
        _this.hostElement = _segmentElement;
        _this.hostElement.style.backgroundColor = _this.getRandomColor();
        _this.container.appendChild(_this.hostElement);
        var _dragging = false;
        var _resizingLeft = false;
        var _resizingRight = false;
        var _lastX;
        var _lastLeftX;
        var _lastRightX;
        _segmentElement.onmousedown = function (ev) {
            _dragging = true;
            _lastX = ev.clientX;
            _highestZ += 10;
            _segmentElement.style.zIndex = _highestZ.toString();
        };
        _leftDragElement.addEventListener("mousedown", function (ev) {
            _resizingLeft = true;
            _lastLeftX = ev.clientX;
            _highestZ += 10;
            ev.stopPropagation();
        });
        _leftDragElement.addEventListener("mouseup", function (ev) {
            _resizingLeft = false;
        });
        _rightDragElement.addEventListener("mousedown", function (ev) {
            _resizingRight = true;
            _lastRightX = ev.clientX;
            _highestZ += 10;
            ev.stopPropagation();
        });
        _rightDragElement.addEventListener("mouseup", function (ev) {
            _resizingRight = false;
        });
        _this.container.addEventListener("mousemove", function (ev) {
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
        _this.container.addEventListener("mouseup", function (ev) {
            _dragging = false;
            _resizingLeft = false;
            _resizingRight = false;
        });
        _segmentElement.addEventListener("mouseup", function (ev) {
            _dragging = false;
            _resizingLeft = false;
            _resizingRight = false;
            _this.updateInfo();
        });
        _this.init();
        return _this;
    }
    Segment.prototype.scaleToFit = function (v) {
        return (this.containerWidth / 6250200) * v;
    };
    Segment.prototype.scaleToGraph = function (v) {
        var d = v / (this.containerWidth / 6250200);
        return d;
    };
    Object.defineProperty(Segment.prototype, "length", {
        get: function () {
            var l = this.scaleToFit(this.end - this.start);
            return l;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Segment.prototype, "containerWidth", {
        get: function () {
            return this.container.clientWidth;
        },
        enumerable: true,
        configurable: true
    });
    Segment.prototype.init = function () {
        this.hostElement.style.width = this.length.toString();
        this.hostElement.style.left = this.scaleToFit(this.start).toString();
    };
    Segment.prototype.updateInfo = function () {
        var evt = {
            name: this.title,
            start: Math.ceil(this.scaleToGraph(parseInt(this.hostElement.style.left))),
            stop: Math.ceil(this.scaleToGraph(parseInt(this.hostElement.style.width)))
        };
        index_1.DemolishedEd.showJSON(evt, demolishedUtils_1.Utils.$(".dlg-timeline"));
        if (this.updateCallback)
            this.updateCallback(evt);
    };
    Segment.prototype.getRandomColor = function () {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };
    return Segment;
}(demolishedModels_1.TimeFragment));
exports.Segment = Segment;
