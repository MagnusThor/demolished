export class DemolishedConfig{


        configuration:Map<string,any>;

        static getInstance():DemolishedConfig{
            return new DemolishedConfig();
        }

        constructor(){
                this.configuration = new Map<string,any>();

        }

        load<T>(key:string):T{
            return this.cast<T>(key);
        }

        cast<T>(key:string):T{
            return this.configuration.get(key) as T;
        }

        save<T>(key:string,value:T){
            this.configuration.set(key,value);
        }

        loadStore(){
            this.configuration.forEach( (a:string,b:any) => { 
                this.configuration.set(b,JSON.parse(a));
            });
        }

        updateStore(){
            this.configuration.forEach( (a:string,b:any) => { 
                localStorage.setItem(b,JSON.stringify(a));
            });
        }

}