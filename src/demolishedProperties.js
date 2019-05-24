"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
class DemolishedPropertyHandler {
    constructor() {
    }
    set(target, key, value, receiver) {
        let old = Reflect.get(target, key, receiver);
        return Reflect.set(target, key, value, receiver);
    }
    get(target, key, receiver) {
        return Reflect.get(target, key, receiver);
    }
    observe() {
    }
}
exports.DemolishedPropertyHandler = DemolishedPropertyHandler;
function Observe(isObserved) {
    return function (target, key) {
        return Reflect.defineMetadata("isObserved", isObserved, target, key);
    };
}
exports.Observe = Observe;
class DemoishedProperty {
    constructor(target) {
        this.target = target;
        this.handler = new DemolishedPropertyHandler();
    }
    getObserver() {
        return new Proxy(this.target, this.handler);
    }
}
exports.DemoishedProperty = DemoishedProperty;
class DemolishedDialogBuilder {
    static render(observer, parent) {
        let keys = Object.keys(observer);
        keys.forEach((key) => {
            let prop = observer[key];
            let isObserved = Reflect.getMetadata("isObserved", observer, key);
            if (isObserved) {
                if (typeof (prop) == "number" || typeof (prop) == "string") {
                    let field = document.createElement("div");
                    let label = document.createElement("label");
                    label.textContent = key;
                    field.appendChild(label);
                    let input = document.createElement("input");
                    input.type = "text";
                    input.id = key;
                    input.value = prop.toString();
                    input.addEventListener("change", (evt) => {
                        observer[key] = evt.target["value"];
                    });
                    input.addEventListener("click", (evt) => {
                        evt.target["value"] = observer[key];
                    });
                    field.appendChild(input);
                    parent.appendChild(field);
                }
                else if (typeof (prop) == "object") {
                    this.render(observer[key], parent);
                }
            }
        });
    }
}
exports.DemolishedDialogBuilder = DemolishedDialogBuilder;
