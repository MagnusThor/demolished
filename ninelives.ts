import { Demolished } from "./src/demolished";
import { DemolishedStreamingMusic } from './src/demolishedSound';
import { ShaderEntity, EntityTexture } from './src/demolishedEntity';
import { TimeFragment, Uniforms, Graph, AudioSettings, AudioAnalyzerSettings } from './src/demolishedModels';
import loadResource from "./src/demolishedLoader";
import { DemolishedTextureGen } from './src/demolishedTexture';



export namespace MyDemo {
        class CustomUniforms extends Uniforms {
                alpha: number;
                constructor(w: number, h: number) {
                        super(w, h);
                }
        }
        export class Ninelives {
                demolished: Demolished.Rendering
                static instance(): Ninelives {
                        return new Ninelives();
                }
                textureGen: DemolishedTextureGen;

                renderTexture(fn:any): any {
                        var base64 = DemolishedTextureGen.createTexture(512, 512,fn);
                        let image = new Image();
                        image.src = base64;
                        return image;

                }

                constructor() {
                        let canvas = document.createElement("canvas") as HTMLCanvasElement;
                        let audio = new DemolishedStreamingMusic();
                        let uniforms = new CustomUniforms(canvas.width, canvas.height);
                        let demo = new Demolished.Rendering(canvas, document.querySelector(".demo"), "", audio, uniforms);

                        let assets = new Array<EntityTexture>();

                        // render the Kaliset texture iChannel0 512x512
                        assets.push(new EntityTexture(this.renderTexture(
                                function (pixel, x, y, w, h) {
                                        var t = this, m = Math;
                                        var kali = function (p) {
                                                var e = 0, l = e;
                                                for (var i = 0; i < 13; i++) {
                                                        var pl = l;
                                                        l = t.length(p);
                                                        var dot = t.dot(p, p);
                                                        p = t.func(p, function (v, i) {
                                                                return m.abs(v) / dot - 0.5
                                                        });
                                                        e += m.exp(-1 / m.abs(l - pl));
                                                }
                                                return e;
                                        }
                                        var k = kali([t.toScale(x, w), t.toScale(y, w), 0]) * .18;
                                        return [Math.abs((k * 1.1) * 255), Math.abs((k * k * 1.3) * 255), Math.abs((k * k * k) * 255)];
                                }
                        ), "iChannel0", 512, 512, 0))

                        // height map ( Perlin Noise )
                        assets.push(new EntityTexture(this.renderTexture(
                                function (pixel, x, y, w, h) {
                                        var r,b,g;
                                        x /= w; y /= h;
                                        var s = 10; var n = this.noise(s * x, s * y, .8);
                                        r = g = b = Math.round(255 * n);
                                        return [r, g, b]; 
                                }
                        ), "iChannel1", 512, 512, 0))
        

                        let as = new AudioSettings();
                        as.audioFile = "assets/plastic.mp3";
                        as.bpm = 129; as.duration = 211800;
                        as.audioAnalyzerSettings = new AudioAnalyzerSettings(8192, .85, -90, -10);
                        audio.createAudio(as).then(() => {
                                demo.resizeCanvas(document.querySelector(".demo"), 2);
                                demo.start(0);

                        })

                        let part = new TimeFragment("nine-lives", 0, 384000, false);

                        demo.timeFragments.push(part);

                        demo.addEntity("nine-lives", assets);

                        document.querySelector(".demo").appendChild(canvas);
                        this.demolished = demo;

                }

        }

}


document.addEventListener("DOMContentLoaded", () => {

        let p = MyDemo.Ninelives.instance();

        window["_demo"] = p;
});