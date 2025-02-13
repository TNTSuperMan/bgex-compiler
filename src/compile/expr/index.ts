import type { BGEXScope } from "..";
import { BGEXExpressionType, type BGEXExpression } from "../../parse/expr";
import { ptr2asm } from "../util";
import type { Variable } from "../var";
import { compileBinaryExpression } from "./binary";
import { compileUnaryExpression } from "./unary";

const IOFunctionMap: {[key: string]: number|void} = { //関数と引数数のマップ
    dumpkey: 0,
    redraw: 0,
    rect: 5,
    graph: 3,
    sound: 1,
    stopsound: 0,
    io: 1
}

export const compileExpression = (scope: BGEXScope, token: BGEXExpression, isBigint?: boolean): string => {
    switch(token.type){
        case BGEXExpressionType.call:
            const arg = `${token.args.length?" ":""}${token.args.map(e=>compileExpression(scope, e)).join(" ")}`;
            const fn = scope.funcs.get(token.name);
            if(fn){
                if(IOFunctionMap[token.name] !== token.args.length) throw new Error("Argument length not match");
                return `${arg} ${fn} call`;
            }else if(IOFunctionMap[token.name] !== undefined){
                if(IOFunctionMap[token.name] !== token.args.length) throw new Error("Argument length not match");
                return `${arg} ${token.name}`;
            }else throw new Error("Not found function: " + token.name)
        case BGEXExpressionType.var:
            const v = scope.vars.reduceRight<Variable|void>((v, c) => v || c.get(token.name), undefined);
            if(!v) throw new Error("Not found variable: " + token.name);
            if(v[0] && !isBigint) throw new Error(`${v[1]} is not normal variable`);
            if(v[0]){
                return `${v[2].toString(16).padStart(2, "0")} ${v[3]?.toString(16).padStart(2, "0")}`
            }else{
                return `${ptr2asm(v[2])} load`;
            }
        case BGEXExpressionType.num:
            if(token.isbig){
                if(!isBigint) throw new Error(`Cannot specify bigint to number`);
                return "" //Bigintどうしよ♨
            }else{
                return token.num.toString(16).padStart(2, "0")
            }
        case BGEXExpressionType.binary:
            return compileBinaryExpression(scope, token.token);
        case BGEXExpressionType.unary:
            return compileUnaryExpression(scope, token.token);
        case BGEXExpressionType.set:
            const va = scope.vars.reduceRight<Variable|void>((v, c) => v || c.get(token.name), undefined);
            if(!va) throw new Error("Not found variable: " + token.name);
            if(va[0]) throw new Error(`${va[1]} is not normal variable`);
            return `${compileExpression(scope, token.value)} ${ptr2asm(va[2])} store`;
        default:
            throw new Error("Not implemented");
    }
}