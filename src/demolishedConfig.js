"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DemolishedConfig = (function () {
    function DemolishedConfig() {
        this.configuration = new Map();
    }
    DemolishedConfig.getInstance = function () {
        return new DemolishedConfig();
    };
    DemolishedConfig.prototype.load = function (key) {
        return this.cast(key);
    };
    DemolishedConfig.prototype.cast = function (key) {
        return this.configuration.get(key);
    };
    DemolishedConfig.prototype.save = function (key, value) {
        this.configuration.set(key, value);
    };
    DemolishedConfig.prototype.loadStore = function () {
        var _this = this;
        this.configuration.forEach(function (a, b) {
            _this.configuration.set(b, JSON.parse(a));
        });
    };
    DemolishedConfig.prototype.updateStore = function () {
        this.configuration.forEach(function (a, b) {
            localStorage.setItem(b, JSON.stringify(a));
        });
    };
    return DemolishedConfig;
}());
exports.DemolishedConfig = DemolishedConfig;
