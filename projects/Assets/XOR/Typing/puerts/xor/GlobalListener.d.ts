declare class Listener {
    private handlers;
    add(fn: Function): void;
    remove(fn: Function): void;
    removeAll(): void;
    invoke(...args: any[]): void;
}
export {};
declare global {
    namespace XOR {
        const globalListener: {
            readonly quit: Listener;
        };
    }
}
