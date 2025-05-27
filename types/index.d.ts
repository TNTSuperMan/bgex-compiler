interface Array<T> {}
interface Boolean {}
interface CallableFunction {}
interface Function {}
interface IArguments {}
interface NewableFunction {}
interface Number {}
interface Object {}
interface RegExp {}
interface String {}

declare function dumpkey(): number;
declare function redraw(): void;
declare function rect(x: number, y: number, w: number, h: number, color: number): void;
declare function graph(id: number, x: number, y: number): void;
declare function sound(id: number): void;
declare function stopsound(): void;
declare function io(id: 0 | 1 | 2 | 3 | 4): void;
declare interface BigInt{
    top: number;
    bottom: number;
}
