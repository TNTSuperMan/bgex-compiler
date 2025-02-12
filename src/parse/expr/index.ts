import type { Expression } from "acorn"
import { parseBinaryExpression, type BGEXBinaryExpression } from "./binary"
import { parseUnaryExpression, type BGEXUnaryExpression } from "./unary"
import { serr } from "../../util"

export const enum BGEXExpressionType{
    var,
    num,
    binary,
    unary,
    call,
    set
}
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
    value: BGEXExpression
}

export const parseExpression = (expr: Expression): BGEXExpression => {
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
                return {
                    type: BGEXExpressionType.num,
                    num,
                    isbig: false
                }
            }else {
                throw SyntaxError(`${expr.raw} is not number`);
            }
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
                return {
                    type: BGEXExpressionType.call,
                    name: expr.callee.name,
                    args: expr.arguments
                        .map(e=>e.type == "SpreadElement" ? e.argument : e)
                        .map(parseExpression)
                }
            }else return serr(`Cannot call ${expr.callee.type}`, expr.start)
        case "AssignmentExpression":
            return {
                type: BGEXExpressionType.set,
                name: expr.left.type == "Identifier" ? expr.left.name :
                serr(`${expr.left.type} variable is not supported`, expr.left.start),
                value: parseExpression(expr.right)
            }
        default:
            return serr(`${expr.type} is not supported expression`, expr.start)
    }
}
