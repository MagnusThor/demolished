import 'reflect-metadata';


export class DemolishedPropertyHandler<T> implements ProxyHandler<Object>{
        constructor() {
        }
        set(target: Object, key: PropertyKey, value: any, receiver: any) {
                let old = Reflect.get(target, key, receiver);
                return Reflect.set(target, key, value, receiver);

        }
        get(target: Object, key: PropertyKey, receiver: any) {

                return Reflect.get(target, key, receiver);
        }
        observe() {

        }

}

/*
Decorator 
*/

export function Observe(isObserved:boolean){
        return function (target:any,key:string) {
                console.log("decorate",key,target);
               return Reflect.defineMetadata("isObserved",isObserved,target,key);
        }
}

export class DemoishedProperty<T>
{
        private handler: DemolishedPropertyHandler<T>
        constructor(public target) {
                this.handler = new DemolishedPropertyHandler<T>();
        }

        getObserver(): T {
                return new Proxy(this.target, this.handler);
        }
}

export class DemolishedDialogBuilder {
        static render(observer: Object, parent: Element) {
                let keys = Object.keys(observer);
                keys.forEach((key: string) => {
                        let prop = observer[key];

                        let isObserved = Reflect.getMetadata("isObserved", observer, key);
                        if(isObserved){
                        if (typeof (prop) == "number" || typeof (prop) == "string") {
                               
                                let field = document.createElement("div");
                                let label = document.createElement("label");
                                label.textContent = key;
                                field.appendChild(label);
                                let input = document.createElement("input");
                                input.type = "text";
                                input.id = key;
                                input.value = prop.toString();
                                input.addEventListener("change", (evt: Event) => {
                                        observer[key] = evt.target["value"];

                                });
                                input.addEventListener("click", (evt: Event) => {
                                        evt.target["value"] = observer[key];
                                });

                                field.appendChild(input);

                                parent.appendChild(field);
                        } else if (typeof (prop) == "object") {
                                 this.render(observer[key],parent);
                        }
                }
                });
        }
}




