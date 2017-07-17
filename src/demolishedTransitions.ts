import { EntityBase } from "./demolishedEntity";

export class DemloshedTransitionBase {
    constructor(public entity: EntityBase){
    }
    fadeIn(time:number):Promise<true>{
        return null;
    }
    fadeOut(time:number):Promise<true>{
        return;
    }
}