"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DemolishedStates {
    constructor() {
        this.states = new Map();
        this.listeners = new Map();
    }
    add(key) {
        this.states.set(key, false);
        return this;
    }
    set(key, value) {
        this.states.set(key, value);
        if (this.listeners.has(key)) {
            this.listeners.get(key).call([value, key]);
        }
        return this;
    }
    get(key) {
        return this.get(key);
    }
    listen(key, fn) {
        this.listeners.set(key, fn);
        return this;
    }
}
exports.DemolishedStates = DemolishedStates;
