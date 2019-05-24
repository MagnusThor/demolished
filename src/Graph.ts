import { EntityTexture, EntityVideoTexture } from './demolishedEntity';
import loadResource from './demolishedLoader';
import { Demolished } from './demolished';
import { Effect, IGraph, AudioSettings } from './demolishedModels';
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
    static loadShared(files: Array<string>): Promise<Map<string,string>> {
        this.shared = new Map();
        return new Promise((resolve, reject) => {
            Promise.all(files.map((f: string) => {
                
                loadResource(f).then(resp => resp.text()).then(result => {
                    this.shared.set(f, result + "\n");
                }).catch( (e) => {
                    reject(e);
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
                return this.loadShared(graph.shared.glsl).then((sh:Map<string,string>) => {
                    engine.shared = sh;
                    engine.audio.createAudio(audioSettings).then((state: boolean) => {
                        graph.effects.forEach((effect: Effect) => {
                            Promise.all(effect.textures.map(async (texture: any) => {
                                if (texture.type == 0) {
                                    const txt = await new Promise((resolve, reject) => {
                                        let image = new Image();
                                        image.src = texture.src;
                                        image.onload = () => {
                                            resolve(image);
                                        };
                                        image.onerror = (err) => reject(err);
                                    });
                                    return new EntityTexture(txt, texture.uniform, texture.width, texture.height);
                                }
                                else {
                                    const vid = await new Promise((resolve, reject) => {
                                        let video = document.createElement('video');
                                        video.src = texture.src;
                                        video.muted = true;
                                        video.loop = true;
                                        video.addEventListener("canplaythrough", () => {
                                            video.play();
                                            resolve(video);
                                        });
                                        video.onerror = (err) => reject(err);
                                    });
                                    return new EntityVideoTexture(vid, texture.uniform, texture.width, texture.height);
                                }
                            })).then((textures: Array<EntityTexture>) => {
                                engine.addEntity(effect.name, textures).setTime(effect.start, effect.stop);
                                // todo: fuzzy.
                                if(engine.entitiesCache.length == graph.effects.length) resolve();
                            });
                        });
                       // resolve();
                    });
                });
            });
        });
    }
}
