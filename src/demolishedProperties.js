"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var DemolishedPropertyHandler = (function () {
    function DemolishedPropertyHandler() {
    }
    DemolishedPropertyHandler.prototype.set = function (target, key, value, receiver) {
        var old = Reflect.get(target, key, receiver);
        return Reflect.set(target, key, value, receiver);
    };
    DemolishedPropertyHandler.prototype.get = function (target, key, receiver) {
        return Reflect.get(target, key, receiver);
    };
    DemolishedPropertyHandler.prototype.observe = function () {
    };
    return DemolishedPropertyHandler;
}());
exports.DemolishedPropertyHandler = DemolishedPropertyHandler;
function Observe(isObserved) {
    return function (target, key) {
        return Reflect.defineMetadata("isObserved", isObserved, target, key);
    };
}
exports.Observe = Observe;
var DemoishedProperty = (function () {
    function DemoishedProperty(target) {
        this.target = target;
        this.handler = new DemolishedPropertyHandler();
    }
    DemoishedProperty.prototype.getObserver = function () {
        return new Proxy(this.target, this.handler);
    };
    return DemoishedProperty;
}());
exports.DemoishedProperty = DemoishedProperty;
var DemolishedDialogBuilder = (function () {
    function DemolishedDialogBuilder() {
    }
    DemolishedDialogBuilder.render = function (observer, parent) {
        var _this = this;
        var keys = Object.keys(observer);
        keys.forEach(function (key) {
            var prop = observer[key];
            var isObserved = Reflect.getMetadata("isObserved", observer, key);
            if (isObserved) {
                if (typeof (prop) == "number" || typeof (prop) == "string") {
                    var field = document.createElement("div");
                    var label = document.createElement("label");
                    label.textContent = key;
                    field.appendChild(label);
                    var input = document.createElement("input");
                    input.type = "text";
                    input.id = key;
                    input.value = prop.toString();
                    input.addEventListener("change", function (evt) {
                        observer[key] = evt.target["value"];
                    });
                    input.addEventListener("click", function (evt) {
                        evt.target["value"] = observer[key];
                    });
                    field.appendChild(input);
                    parent.appendChild(field);
                }
                else if (typeof (prop) == "object") {
                    _this.render(observer[key], parent);
                }
            }
        });
    };
    return DemolishedDialogBuilder;
}());
exports.DemolishedDialogBuilder = DemolishedDialogBuilder;
