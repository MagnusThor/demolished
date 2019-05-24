export class DemolishedStates {
    states: Map<string, boolean>;
    listeners: Map<string, (a, b) => void>;
    constructor() {
        this.states = new Map<string, boolean>();
        this.listeners = new Map<string, (a, b) => void>();
    }
    add(key: string): DemolishedStates {
        this.states.set(key, false);
        return this;
    }
    set(key: string, value: any): DemolishedStates {
        this.states.set(key, value);
        if (this.listeners.has(key)) {
            this.listeners.get(key).call([value, key]);
        }
        return this;
    }
    get<T>(key: string): T {
        return this.get(key);
    }
    listen(key: string, fn: (state: boolean, key: string) => void): DemolishedStates {
        this.listeners.set(key, fn);
        return this;
    }
}
