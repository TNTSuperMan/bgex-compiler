import type { BGEXScope } from "..";
import { BGEXExpressionType, type BGEXAssignmentOperator, type BGEXExpression } from "../../parse/expr";
import type { BGEXBinaryExpressionType } from "../../parse/expr/binary";
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
    io: 1,
    ret: NaN
}
const AssignmentMap: {[key in BGEXAssignmentOperator]: BGEXBinaryExpressionType} = {
    "=": "==",
    "+=":"+",
    "-=":"-",
    "*=":"*",
    "/=":"/",
    "%=":"%",
    "&=":"&",
    "^=":"^",
    "|=":"|",
    "&&=":"&&",
    "||=":"||",
}

export const compileExpression = (scope: BGEXScope, token: BGEXExpression, isBigint?: boolean): string => {
    switch(token.type){
        case BGEXExpressionType.call:
            const arg = `${token.args.length?" ":""}${token.args.map(e=>compileExpression(scope, e)).join(" ")}`;
            const fn = scope.funcs.get(token.name);
            if(fn){
                if(fn[3] !== token.args.length)
                    throw new Error(`Argument length not match(${fn[1]}:${fn[3]} != ${token.args.length})`);
                return `${arg} :fn_${fn[2]} call`;
            }else if(IOFunctionMap[token.name] !== undefined){
                if(!isNaN(IOFunctionMap[token.name]??0) &&
                    IOFunctionMap[token.name] !== token.args.length)
                    throw new Error(`Argument length not match(${token.name}:${IOFunctionMap[token.name]} != ${token.args.length})`);
                return `${arg} ${token.name}`;
            }else throw new Error("Not found function: " + token.name)
        case BGEXExpressionType.var:
            const v = scope.vars.reduceRight<Variable|void>((v, c) => v || c.get(token.name), undefined);
            if(!v) throw new Error("Not found variable: " + token.name);
            if(v[0]){
                if(!isBigint) throw new Error(`${v[1]} is not normal variable`);
                return `${ptr2asm(v[2])} load ${ptr2asm(v[3])} load`
            }else{
                return `${ptr2asm(v[2])} load`;
            }
        case BGEXExpressionType.num:
            if(token.isbig){
                if(!isBigint) throw new Error(`Cannot specify bigint to number`);
                return `!${Math.floor(token.num/256).toString(16).padStart(2, "0")} ${(token.num%256).toString(16).padStart(2, "0")}`
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
            if(!va[0])
                if(token.opr == "=")
                    return `${compileExpression(scope, token.value)} ${ptr2asm(va[2])} store`;
                else return `${compileExpression(scope, {
                    type: BGEXExpressionType.binary,
                    token: {
                        type: AssignmentMap[token.opr],
                        left: {
                            type: BGEXExpressionType.var,
                            name: token.name
                        },
                        right: token.value
                    }
                })} ${ptr2asm(va[2])} store`;
            else
                if(token.opr == "="){
                    const value = compileExpression(scope, token.value, true);
                    if(value.startsWith("!"))
                        return `${value.substring(1)} ${ptr2asm(va[3])} store ${ptr2asm(va[2])} store`;
                    else
                        return `0 ${ptr2asm(va[2])} store ${value} ${ptr2asm(va[3])} store`
                }else if(token.opr == "+="){
                    return `${ptr2asm(va[2])} ${ptr2asm(va[3])} ${compileExpression(scope, token.value)} :std_bigint_add call`;
                }else if(token.opr == "-="){
                    return `${ptr2asm(va[2])} ${ptr2asm(va[3])} ${compileExpression(scope, token.value)} :std_bigint_sub call`;
                }else throw new Error(token.opr+" is not supported bigint assignment")
        case BGEXExpressionType.setbig:
            const bva = scope.vars.reduceRight<Variable|void>((v, c) => v || c.get(token.name), undefined);
            if(!bva) throw new Error(`Not found variable: ${token.name}`);
            if(!bva[0]) throw new Error(`Not found bigint variable: ${token.name}`);
            return `${compileExpression(scope, {
                    type: BGEXExpressionType.binary,
                    token: {
                        type: AssignmentMap[token.opr],
                        left: {
                            type: BGEXExpressionType.var,
                            name: token.name
                        },
                        right: token.value
                    }
                })} ${ptr2asm(token.at ? bva[3] : bva[2])} store`;
        case BGEXExpressionType.macro:
            if(!scope.macro) throw new Error("Macro is not defined");
            return scope.macro(scope, ...token.args);
        case BGEXExpressionType.biprop:
            const vab = scope.vars.reduceRight<Variable|void>((v, c) => v || c.get(token.name), undefined);
            if(!vab) throw new Error("Not found variable: " + token.name);
            if(!vab[0]) throw new Error(token.name + " is not bigint variable");
            return ptr2asm(token.at?vab[3]:vab[2])+" load"
        default:
            throw new Error("Not implemented");
    }
}