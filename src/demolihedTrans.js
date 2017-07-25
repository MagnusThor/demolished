"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DemolishedTrans = (function () {
    function DemolishedTrans(parentEl, graph) {
        this.parentEl = parentEl;
        this.graph = graph;
        this.parent = document.querySelector(parentEl);
    }
    DemolishedTrans.prototype.createTimeout = function (name, start, classes) {
        var _this = this;
        var i = setTimeout(function () {
            classes.forEach(function (cssClass) {
                _this.parent.classList.add(cssClass);
            });
            _this.parent.addEventListener("animationend", function () {
                _this.parent.classList.remove(classes);
            });
        }, start);
    };
    DemolishedTrans.prototype.start = function (n) {
        var _this = this;
        this.graph.timeLine.forEach(function (el, i) {
            _this.createTimeout(el.name, el.start, el.classes);
        });
    };
    return DemolishedTrans;
}());
exports.DemolishedTrans = DemolishedTrans;
var Trans = (function () {
    function Trans() {
    }
    return Trans;
}());
exports.Trans = Trans;
