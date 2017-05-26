import {
    Demolished
} from './src/demolished'
import {
    DemolishedRecorder
} from './src/demolishedRecorder';

class DemolishInstance {
    world: Demolished.World;
    recorder: DemolishedRecorder;

    onReady(): void {}
    constructor() {

        let analyzerSettings = new Demolished.AudioAnalyzerSettings(8192, 0.85, -100, -30);

        let canvas = document.querySelector("#gl") as HTMLCanvasElement;

        let assetsFile = window.location.hash === "" ? "timeline.json" : window.location.hash.replace("#", "");

        this.world = new Demolished.World(canvas,
            "entities/" + assetsFile, analyzerSettings);

        this.world.onReady = () => {
            this.onReady();
        }

        this.world.onStart = () => {
            let p = document.querySelector("#record-canvas") as any;
            if (p.checked) {
                let videoStream = this.world.canvas["captureStream"](60) as MediaStream;
                let videoTrack = videoStream.getVideoTracks()[0];
                let audioTrack = this.world.getAudioTracks()[0];

                this.recorder = new DemolishedRecorder(videoTrack, audioTrack);
                this.recorder.start(1000);
            }

        }

        this.world.onStop = () => {

            if (this.recorder) {

                let recorderNode = document.querySelector("#recording");

                this.recorder.stop();

                let blob = new Blob(this.recorder.data, {
                    type: 'video/webm'
                });
                let url = window.URL.createObjectURL(blob);
                let downloadlink = document.createElement('a');
                downloadlink.textContent = "download recording"
                downloadlink.href = url;

                recorderNode.classList.remove("hide");
                recorderNode.appendChild(downloadlink);

            }

        }


    }
}

document.addEventListener("DOMContentLoaded", () => {

    let launchButton: HTMLButtonElement =

        document.querySelector("#full-screen") as HTMLButtonElement;

    function launchFullscreen(element) {
        if (element.requestFullscreen) {
            element.requestFullscreen();
        } else if (element.mozRequestFullScreen) {
            element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) {
            element.webkitRequestFullscreen();
        } else
        if (element.msRequestFullscreen) {
            element.msRequestFullscreen();
        }
    }

    let demolished = new DemolishInstance()

    window["demo"] = demolished;

    demolished.onReady = () => {
        launchButton.disabled = false;

    };

    launchButton.addEventListener("click", function () {
        launchButton.classList.add("hide");
        demolished.world.start(0);
    });

});