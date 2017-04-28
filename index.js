"use strict";
const demolished_1 = require('./src/demolished');
class DemolishInstance {
    constructor() {
        this.world = new demolished_1.Demolished.World();
        this.world.onReady = () => {
            this.world.animate(0);
        };
    }
}
document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("resize", function (evt) {
        resize();
    });
    function resize() {
        var el = document.querySelector("#gl");
        el.setAttribute("height", window.innerHeight.toString());
        el.setAttribute("width", window.innerWidth.toString());
    }
    resize();
    let d = new DemolishInstance();
    window["demolished"] = d;
});
