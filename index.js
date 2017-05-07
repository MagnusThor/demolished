"use strict";
const demolished_1 = require('./src/demolished');
class DemolishInstance {
    constructor() {
        this.world = new demolished_1.Demolished.World(document.querySelector("#gl"));
        this.world.onReady = () => {
            this.onReady();
        };
    }
    onReady() {
    }
}
document.addEventListener("DOMContentLoaded", () => {
    let launchButton = document.querySelector("#full-screen");
    function launchFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        }
        else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        }
        else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        }
        else if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }
    let demolished = new DemolishInstance();
    demolished.onReady = () => {
        console.log("ready to start...");
        launchButton.disabled = false;
        launchButton.textContent = "Press to start!";
    };
    launchButton.addEventListener("click", function () {
        //launchFullscreen(document.querySelector("#main"));
        launchButton.style.display = "none";
        demolished.world.start(0);
    });
});
