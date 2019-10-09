import { EntityVideoTexture } from "./EntityVideoTexture";
import { EntityTexture } from "./EntityTexture";
import loadResource from './demolishedLoader';
import { Demolished } from './demolished';
import { Effect, IGraph, AudioSettings } from './demolishedModels';
import { IEntityTexture } from "./IEntityTexture";
/**
 *
 *
 * @export
 * @class Graph
 */
export class Graph {
    audioSettings: any;
    effects: Array<Effect>;
    name: string;
    duration: number;
    // timeline: Array<TimeFragment>;
    shared: any;
    static shared: any;
    static entitiesCache: any;
    static engine: any;

    static loadTextures(textures: Array<IEntityTexture>): Promise<Array<IEntityTexture>> {
        return new Promise<Array<IEntityTexture>>((resolve, reject) => {
                Promise.all(textures.map(async (texture: IEntityTexture) => {
                if (texture.type == 0) {
                     let img = await new Promise<HTMLImageElement>((resolve, reject) => {
                        let image = document.createElement("img");
                        image.src = texture.src;
                        image.onload = () => {
                            resolve(image);
                        };
                        image.onerror = (err) => reject(err);
                    });
                    return new EntityTexture(img, texture.name, texture.width, texture.height);
                }
                else {
                     let img = await new Promise<HTMLVideoElement>((resolve, reject) => {
                        let video = document.createElement('video');
                        video.src = texture.src;
                        video.muted = true;
                        video.loop = true;
                        video.addEventListener("canplaythrough", () => {
                            video.play();
                            resolve(video);
                        });
                        video.onerror =  (err)  => {
                            reject(err);
                        } 
                    });
                    return new EntityVideoTexture(img, texture.name, texture.width, texture.height);                }

            })).then( (result:Array<IEntityTexture>) => {
                
                resolve(result);
            }).catch( reason => reject(reason));
        });
    }

    static loadShared(files: Array<string>): Promise<Map<string, string>> {
        this.shared = new Map();
        return new Promise((resolve, reject) => {
            Promise.all(files.map((f: string) => {
                loadResource(f).then(resp => resp.text()).then(result => {
                    this.shared.set(f, result + "\n");
                }).catch((reason) => {
                    reject(reason);
                });
            })).then(() => {
                resolve(this.shared);
            });
        });
    }
    static loadGraph(graphFile: string): Promise<IGraph> {
        return loadResource(graphFile).then((response: Response) => {
            return response.json();
        }).then((graph: IGraph) => {
            return graph;
        });
    }

    static Load(file: string, engine: Demolished.Rendering): Promise<Graph> {
        this.engine = engine;
        return new Promise<Graph>((resolve, reject) => {
            Graph.loadGraph(file).then((graph: IGraph) => {
                engine.graph = graph;
                let audioSettings: AudioSettings = graph.audioSettings;
                console.log("audioSettings",audioSettings);
                return this.loadShared(graph.shared.glsl).then((sh: Map<string, string>) => {
                    engine.shared = sh;
                    console.log("sharedSource",this.shared);
                    this.loadTextures(graph.textures).then((textures: Array<IEntityTexture>) => {
                        console.log("textures", textures);
                        textures.forEach( (t:IEntityTexture) => {
                            console.log("adding texture",t);
                            engine.textureCache.add(t);
                        });
                        graph.effects.forEach((effect: Effect) => {
                            console.log("effect(s)",effect);
                            engine.addEntity(effect.name, effect.textures).setTime(effect.start, effect.stop);
                        });
                    }).then(() => {
                        engine.audio.createAudio(audioSettings).then((state: boolean) => {
                        console.log("audio Created",engine.audio); 
                        resolve();
                        });
                    });
                });
            }).catch( reason => reject(reason));
        });
    }
}
