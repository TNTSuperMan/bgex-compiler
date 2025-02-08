import type { BGEXVar } from "../parse/var";
// isbig, addr, name, initial
export type Variable = [0, number, string, string] | [1, number, number, string, string];
let vi = 0xa000;
export const parseVariable = (vd: BGEXVar): Variable => {
    if(vi >= 0xefff) throw new RangeError("Too many variables, count: " + vi);
    if(vd.isbig){//TODO: expressionパーサーが完成したらinitの初期化
        return [1, vi++, vi++, vd.name, ""]
    }else{
        return [0, vi++, vd.name, ""];
    }
}
export const useVariable = (name: string): Variable => {
    if(vi >= 0xefff) throw new RangeError("Too many variables, count: " + vi);
    return [0, vi++, name, ""]
}
