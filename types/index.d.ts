declare function dumpkey(): number;
declare function redraw(): void;
declare function rect(x: number, y: number, w: number, h: number, color: number): void;
declare function graph(id: number, x: number, y: number): void;
declare function sound(id: number): void;
declare function stopsound(): void;
declare function io(id: 0 | 1 | 2 | 3): void;
declare interface BigInt{
    ua: number;
    uv: number;
    da: number;
    dv: number;
}
