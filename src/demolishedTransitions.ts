import { ShaderEntity } from "./demolishedEntity";

export class DemlolishedTransitionBase {
    constructor(public entity: ShaderEntity){
    }
    fadeIn(time:number):Promise<true>{
        return null;
    }
    fadeOut(time:number):Promise<true>{
        return;
    }
}