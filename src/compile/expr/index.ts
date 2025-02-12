import type { BGEXScope } from "..";
import { BGEXExpressionType, type BGEXExpression } from "../../parse/expr";

const IOFunctionMap: {[key: string]: number|void} = { //関数と引数数のマップ
    dumpkey: 0,
    redraw: 0,
    rect: 5,
    graph: 3,
    sound: 1,
    stopsound: 0,
    io: 1
}

export const compileExpression = (scope: BGEXScope, token: BGEXExpression): string => {
    switch(token.type){
        case BGEXExpressionType.call:
            const arg = `/ ${token.args.map(e=>compileExpression(scope, e)).join(" ")}`;
            const fn = scope.funcs.get(token.name);
            if(fn){
                if(IOFunctionMap[token.name] !== token.args.length) throw new Error("Argument length not match");
                return `${arg} ${fn} call`;
            }else if(IOFunctionMap[token.name] !== undefined){
                if(IOFunctionMap[token.name] !== token.args.length) throw new Error("Argument length not match");
                return `${arg} ${token.name}`;
            }else throw new Error("Not found function: " + token.name)
            break;
        default:
            throw new Error("Not implemented");
    }
}