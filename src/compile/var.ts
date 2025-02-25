import type { BGEXVar } from "../parse/var";
// isbig, name, addr
type IntVariable = [0, string, number];
type BigIntVariable = [1, string, number, number];
export type Variable = IntVariable | BigIntVariable;
let varInitializer: [string, string][] = []; // init, name

let vi = 0xa005;
export const parseVariable = (vd: BGEXVar): Variable => {
    if(vi >= 0xefff) throw new RangeError("Too many variables, count: " + vi);
    if(vd.isbig){//TODO: expressionパーサーが完成したらinitの初期化
        return [1, vd.name, vi++, vi++]
    }else{
        return [0, vd.name, vi++];
    }
}
export const useVariable = (name: string): Variable => {
    if(vi >= 0xefff) throw new RangeError("Too many variables, count: " + vi);
    return [0, name, vi++]
}
