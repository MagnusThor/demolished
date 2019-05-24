import { Uniforms, UniformsBase } from './Uniforms';
export class Pipleline<T>{
    handler: PiplelineHandler<T>
    constructor(public target: any) {
        this.handler = new PiplelineHandler<T>();
    }
}
export class PiplelineHandler<T> implements ProxyHandler<Object>{
    private static readonly descriptor: PropertyDescriptor = { configurable: true, enumerable: true, writable: false };
    observers: Map<string, Function | any> = new Map<string, Function>();
    constructor() { }
    // construct(target: T, params: any) {
    //     return this;
    // }
    set(target: UniformsBase, property: PropertyKey ,value: any): boolean {

        let priorValue = target[property];
        target[property] = value;

        let au = target.activeUniforms.find((pre: any) => pre.name == property); 

        if(!au) return true; 

        const change = {
            priorValue, value, property, target, map: target.mapType(value, au),
            location: target.location(property)
        };
   
        this.onPropertyChange(change);
      
        return true;
    }
    onPropertyChange(a: any) {
        try {
            a.map.args.unshift(a.location);
            a.target.gl[a.map.mi].apply(a.target.gl, a.map.args);

            if (this.observers.has(a.property))
                this.observers.get(a.property).call(a.target, a.map.args);
        } catch (e) {
            this.onError(e, a);
        }
    }
    onError(e: Error, a: {}) {
        throw e;
    }
    bind(key: string, cb: any) {
        this.observers.set(key, cb);
        return this;
    }
    unbind(key: string) {
        this.observers.delete(key)
        return this;
    }
}