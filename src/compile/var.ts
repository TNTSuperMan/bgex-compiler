import type { BGEXScope } from ".";
import type { BGEXVar } from "../parse/var";
// isbig, name, addr
type IntVariable = [0, string, number];
type BigIntVariable = [1, string, number, number];
export type Variable = IntVariable | BigIntVariable;
let varInitializer: [string, string][] = []; // init, name
export let varMap: [number, string, string][] = [
    [0xa000, "internal", "uu"],
    [0xa001, "internal", "ud"],
    [0xa002, "internal", "du"],
    [0xa003, "internal", "dd"],
    [0xa004, "internal", "value"],
]

let vi = 0xa005;
export const parseVariable = (scope: BGEXScope, vd: BGEXVar): Variable => {
    if(vi >= 0xefff) throw new RangeError("Too many variables, count: " + vi);
    const at = scope.getAt(vd.at);
    if(vd.isbig){//TODO: expressionパーサーが完成したらinitの初期化
        varMap.push([vi, `${scope.path}:${at[0]}:${at[1]}`, vd.name+"(bigint)"])
        varMap.push([vi+1, `${scope.path}:${at[0]}:${at[1]}`, vd.name+"(bigint)"])
        return [1, vd.name, vi++, vi++]
    }else{
        varMap.push([vi, `${scope.path}:${at[0]}:${at[1]}`, vd.name])
        return [0, vd.name, vi++];
    }
}
export const useVariable = (name: string): Variable => {
    if(vi >= 0xefff) throw new RangeError("Too many variables, count: " + vi);
    return [0, name, vi++]
}
