"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var SmartArray = (function (_super) {
    __extends(SmartArray, _super);
    function SmartArray(array) {
        var _this = _super.call(this) || this;
        _this.take = function (n) { return _this.splice(_this.currentIndex, n); };
        _this.skip = function (x) { return _this.currentIndex = x; };
        _this.first = function () { return _this.dataArray[0]; };
        _this.add = function (x, y) { return x + y; };
        _this.sum = function (xs) { return xs.reduce(_this.add, 0); };
        _this.average = function (xs) { return xs[0] === undefined ? NaN : _this.sum(xs) / xs.length; };
        _this.delta = function (_a) {
            var x = _a[0], xs = _a.slice(1);
            return xs.reduce(function (_a, x) {
                var acc = _a[0], last = _a[1];
                return [
                    acc.concat([x - last]),
                    x
                ];
            }, [
                [], x
            ])[0];
        };
        if (array instanceof Array) {
            _this.dataArray = array;
        }
        else
            _this.dataArray = new Array();
        _this.currentIndex = 0;
        return _this;
    }
    Object.defineProperty(SmartArray.prototype, "interpolate", {
        get: function () {
            if (!this.dataArray.length)
                return 0;
            var counts = {};
            var mode = null;
            var max = 0;
            this.dataArray.forEach(function (item) {
                var value = Math.round(item * 10) / 10;
                counts[value] = (counts[value] || 0) + 1;
                if (counts[value] > max) {
                    max = counts[value];
                    mode = value;
                }
            });
            return mode;
        },
        enumerable: true,
        configurable: true
    });
    SmartArray.prototype.median = function () {
        if (!this.dataArray.length)
            return 0;
        var midPoint = Math.floor(this.dataArray.length / 2);
        return this.dataArray[midPoint];
    };
    SmartArray.prototype.empty = function () {
        this.dataArray.length = 0;
    };
    return SmartArray;
}(Array));
exports.SmartArray = SmartArray;
