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
    macro
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
    type: BGEXExpressionType.macro,
    args: (Expression|SpreadElement)[]
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
                    return {
                        type: BGEXExpressionType.set,
                        name: expr.left.type == "Identifier" ? expr.left.name :
                        serr(`${expr.left.type} variable is not supported`, expr.left.start),
                        value: parseExpression(expr.right),
                        opr: expr.operator
                    }
            }
        default:
            return serr(`${expr.type} is not supported expression`, expr.start)
    }
}
