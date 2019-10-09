"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const EntityVideoTexture_1 = require("./EntityVideoTexture");
const EntityTexture_1 = require("./EntityTexture");
const demolishedLoader_1 = require("./demolishedLoader");
class Graph {
    static loadTextures(textures) {
        return new Promise((resolve, reject) => {
            Promise.all(textures.map((texture) => __awaiter(this, void 0, void 0, function* () {
                if (texture.type == 0) {
                    let img = yield new Promise((resolve, reject) => {
                        let image = document.createElement("img");
                        image.src = texture.src;
                        image.onload = () => {
                            resolve(image);
                        };
                        image.onerror = (err) => reject(err);
                    });
                    return new EntityTexture_1.EntityTexture(img, texture.name, texture.width, texture.height);
                }
                else {
                    let img = yield new Promise((resolve, reject) => {
                        let video = document.createElement('video');
                        video.src = texture.src;
                        video.muted = true;
                        video.loop = true;
                        video.addEventListener("canplaythrough", () => {
                            video.play();
                            resolve(video);
                        });
                        video.onerror = (err) => {
                            reject(err);
                        };
                    });
                    return new EntityVideoTexture_1.EntityVideoTexture(img, texture.name, texture.width, texture.height);
                }
            }))).then((result) => {
                resolve(result);
            }).catch(reason => reject(reason));
        });
    }
    static loadShared(files) {
        this.shared = new Map();
        return new Promise((resolve, reject) => {
            Promise.all(files.map((f) => {
                demolishedLoader_1.default(f).then(resp => resp.text()).then(result => {
                    this.shared.set(f, result + "\n");
                }).catch((reason) => {
                    reject(reason);
                });
            })).then(() => {
                resolve(this.shared);
            });
        });
    }
    static loadGraph(graphFile) {
        return demolishedLoader_1.default(graphFile).then((response) => {
            return response.json();
        }).then((graph) => {
            return graph;
        });
    }
    static Load(file, engine) {
        this.engine = engine;
        return new Promise((resolve, reject) => {
            Graph.loadGraph(file).then((graph) => {
                engine.graph = graph;
                return this.loadShared(graph.shared.glsl).then((sh) => {
                    engine.shared = sh;
                    console.log("sharedSource", this.shared);
                    this.loadTextures(graph.textures).then((textures) => {
                        console.log("textures", textures);
                        textures.forEach((t) => {
                            console.log("adding texture", t);
                            engine.textureCache.add(t);
                        });
                        graph.effects.forEach((effect) => {
                            console.log("effect(s)", effect);
                            engine.addEntity(effect.name, effect.textures).setTime(effect.start, effect.stop);
                        });
                    }).then(() => {
                        resolve(graph);
                    });
                });
            }).catch(reason => reject(reason));
        });
    }
}
exports.Graph = Graph;
