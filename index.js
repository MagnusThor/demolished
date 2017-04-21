"use strict";
const demolished_1 = require('./src/demolished');
class DemolishInstance {
    constructor() {
        this.world = new demolished_1.Demolished.World();
        this.world.addEntity("plasma");
        this.world.animate();
    }
}
document.addEventListener("DOMContentLoaded", () => {
    let d = new DemolishInstance();
    console.log("d", d);
});
