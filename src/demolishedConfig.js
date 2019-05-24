"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DemolishedConfig {
    static getInstance() {
        return new DemolishedConfig();
    }
    constructor() {
        this.configuration = new Map();
    }
    load(key) {
        return this.cast(key);
    }
    cast(key) {
        return this.configuration.get(key);
    }
    save(key, value) {
        this.configuration.set(key, value);
    }
    loadStore() {
        this.configuration.forEach((a, b) => {
            this.configuration.set(b, JSON.parse(a));
        });
    }
    updateStore() {
        this.configuration.forEach((a, b) => {
            localStorage.setItem(b, JSON.stringify(a));
        });
    }
}
exports.DemolishedConfig = DemolishedConfig;
