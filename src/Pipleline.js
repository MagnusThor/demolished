"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Pipleline {
    constructor(target) {
        this.target = target;
        this.handler = new PiplelineHandler();
    }
}
exports.Pipleline = Pipleline;
class PiplelineHandler {
    constructor() {
        this.observers = new Map();
    }
    set(target, property, value) {
        let priorValue = target[property];
        target[property] = value;
        let au = target.activeUniforms.find((pre) => pre.name == property);
        if (!au)
            return true;
        const change = {
            priorValue, value, property, target, map: target.mapType(value, au),
            location: target.location(property)
        };
        this.onPropertyChange(change);
        return true;
    }
    onPropertyChange(a) {
        try {
            a.map.args.unshift(a.location);
            a.target.gl[a.map.mi].apply(a.target.gl, a.map.args);
            if (this.observers.has(a.property))
                this.observers.get(a.property).call(a.target, a.map.args);
        }
        catch (e) {
            this.onError(e, a);
        }
    }
    onError(e, a) {
        throw e;
    }
    bind(key, cb) {
        this.observers.set(key, cb);
        return this;
    }
    unbind(key) {
        this.observers.delete(key);
        return this;
    }
}
PiplelineHandler.descriptor = { configurable: true, enumerable: true, writable: false };
exports.PiplelineHandler = PiplelineHandler;
