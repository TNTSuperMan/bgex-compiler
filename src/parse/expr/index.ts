import type { Expression, SpreadElement } from "acorn"
import { parseBinaryExpression, type BGEXBinaryExpression } from "./binary"
import { parseUnaryExpression, type BGEXUnaryExpression } from "./unary"
import { serr } from "../../util"

export const enum BGEXExpressionType{
    var,
    num,
    binary,
    unary,
    call,
    set,
    setbig,
    macro,
    biprop
}
export type BGEXAssignmentOperator = "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "|=" | "^=" | "&=" | "||=" | "&&=";
export type BGEXExpression = {
    type: BGEXExpressionType.var,
    name: string
} | {
    type: BGEXExpressionType.num,
    num: number,
    isbig: boolean
} | {
    type: BGEXExpressionType.binary,
    token: BGEXBinaryExpression
} | {
    type: BGEXExpressionType.unary,
    token: BGEXUnaryExpression
} | {
    type: BGEXExpressionType.call,
    name: string,
    args: BGEXExpression[]
} | {
    type: BGEXExpressionType.set,
    name: string,
    value: BGEXExpression,
    opr: BGEXAssignmentOperator
} | {
    type: BGEXExpressionType.setbig,
    name: string,
    at: 0 | 1,
    value: BGEXExpression
    opr: BGEXAssignmentOperator
} | {
    type: BGEXExpressionType.macro,
    args: (Expression|SpreadElement)[]
} | {
    type: BGEXExpressionType.biprop,
    name: string,
    at: 0 | 1
}

export const parseExpression = (expr: Expression, isGlobal?: boolean | number): BGEXExpression => {
    switch(expr.type){
        case "Identifier":
            return {
                type: BGEXExpressionType.var,
                name: expr.name
            }
        case "Literal":
            const num = parseInt(expr.raw??"");
            if(/^\d+n$/.test(expr.raw??"")){
                const value = parseInt(expr.raw ?? "");

                return {
                    type: BGEXExpressionType.num,
                    num: value,
                    isbig: true
                }
            }else if(Number.isInteger(num)){
                if(num > 0xff) throw new SyntaxError(`${num} is Too big number`)
                return {
                    type: BGEXExpressionType.num,
                    num,
                    isbig: false
                }
            }else {
                throw SyntaxError(`${expr.raw} is not number`);
            }
        case "LogicalExpression":
        case "BinaryExpression":
            return {
                type: BGEXExpressionType.binary,
                token: parseBinaryExpression(expr)
            }
        case "UnaryExpression":
            return {
                type: BGEXExpressionType.unary,
                token: parseUnaryExpression(expr)
            }
        case "CallExpression":
            if(expr.callee.type === "Identifier"){
                if(expr.callee.name == "$") return {
                    type: BGEXExpressionType.macro,
                    args: expr.arguments
                }
                return {
                    type: BGEXExpressionType.call,
                    name: expr.callee.name,
                    args: expr.arguments
                        .map(e=>e.type == "SpreadElement" ? e.argument : e)
                        .map(parseExpression)
                }
            }else return serr(`Cannot call ${expr.callee.type}`, expr.start)
        case "AssignmentExpression":
            if(isGlobal !== true) return serr(`Cannot assign at not global`, expr.start);
            switch(expr.operator){
                case"**=":case"<<=":case">>=":case">>>=":case"??=":
                    return serr(`${expr.operator} assign is not supported`, expr.start);
                default:
                    if(expr.left.type == "Identifier"){
                        return {
                            type: BGEXExpressionType.set,
                            name: expr.left.name,
                            value: parseExpression(expr.right),
                            opr: expr.operator
                        }
                    }else if(expr.left.type == "MemberExpression"){
                        return {
                            type: BGEXExpressionType.setbig,
                            name: expr.left.object.type == "Identifier" ?
                                expr.left.object.name :
                                serr(`${expr.left.object.type} bigint is not supported`, expr.left.object.start),
                            at: expr.left.property.type == "Identifier"?
                                    expr.left.property.name == "top" ? 0 :
                                        expr.left.property.name == "bottom" ? 1 :
                                        serr(`${expr.left.property.name} is not supported bigint property`, expr.left.property.start) :
                                serr(`${expr.left.property.type} is not supported bigint property type`, expr.left.property.start),
                            value: parseExpression(expr.right),
                            opr: expr.operator
                        }
                    }else{
                        return serr(`${expr.left.type} variable is not supported`, expr.left.start)
                    }
            }
        case "MemberExpression":
            const target = expr.object;
            if(target.type == "Identifier"){
                const name = target.name;
                if(expr.property.type == "Identifier"){
                    switch(expr.property.name){
                        case "top":
                            return {type:BGEXExpressionType.biprop,name,at:0}
                        case "bottom":
                            return {type:BGEXExpressionType.biprop,name,at:1}
                        default:
                            return serr(`${expr.property.name} is not supported property`, expr.property.start)
                    }
                }else{
                    return serr(`${expr.property.type} is not supported property type`, expr.property.start)
                }
            }else{
                return serr(`${expr.object.type} is not bigint var`, expr.object.start);
            }
        default:
            return serr(`${expr.type} is not supported expression`, expr.start)
    }
}
