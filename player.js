"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var demolishedPlayer_1 = require("./src/demolishedPlayer");
var PlayerDemo = /** @class */ (function () {
    function PlayerDemo() {
        var shaders = [{ v: '', f: '' }, { v: '', f: '' }];
        this.player = new demolishedPlayer_1.DemolishedPlayer(512, 512, {
            a: {
                n: 'strobe',
                s: 0,
                e: 12000
            },
            b: {
                n: ' kch',
                s: 12000,
                e: 22000
            }
        }, shaders);
    }
    PlayerDemo.I = function () {
        return new PlayerDemo();
    };
    return PlayerDemo;
}());
document.addEventListener("DOMContentLoaded", function () {
    console.log("load");
    PlayerDemo.I();
});
