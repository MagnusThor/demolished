"use strict";
var demolished_1 = require('./src/demolished');
var DemolishInstance = (function () {
    function DemolishInstance() {
        var _this = this;
        this.world = new demolished_1.Demolished.World(document.querySelector("#gl"));
        this.world.onReady = function () {
            _this.onReady();
        };
    }
    DemolishInstance.prototype.onReady = function () {
    };
    return DemolishInstance;
}());
document.addEventListener("DOMContentLoaded", function () {
    var launchButton = document.querySelector("#full-screen");
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
    var demolished = new DemolishInstance();
    demolished.onReady = function () {
        console.log("ready to start...");
        launchButton.disabled = false;
        launchButton.textContent = "Press to start!";
    };
    launchButton.addEventListener("click", function () {
        launchFullscreen(document.querySelector("#main"));
        launchButton.style.display = "none";
        demolished.world.start(0);
    });
});
