"use strict";
const demolished_1 = require('./src/demolished');
class DemolishInstance {
    constructor() {
        this.world = new demolished_1.Demolished.World();
        // this.world.animate();
    }
}
document.addEventListener("DOMContentLoaded", () => {
    let d = new DemolishInstance();
    window["food"] = d;
});
