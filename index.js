"use strict";
const demolished_1 = require('./src/demolished');
class DemolishInstance {
    constructor() {
        this.world = new demolished_1.Demolished.World(document.querySelector("#gl"));
        window.setTimeout(() => {
            this.world.onReady = () => {
                this.world.start(0);
            };
        }, 2000);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    window["demolished"] = new DemolishInstance();
});
