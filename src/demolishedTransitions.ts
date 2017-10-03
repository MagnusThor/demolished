import { ShaderEntity } from "./demolishedEntity";

export class DemloshedTransitionBase {
    constructor(public entity: ShaderEntity){
    }
    fadeIn(time:number):Promise<true>{
        return null;
    }
    fadeOut(time:number):Promise<true>{
        return;
    }
}