import type { UnaryExpression } from "acorn"
import { parseExpression, type BGEXExpression } from "."
import { serr } from "../../util";

export type BGEXUnaryExpressionType =
    "!"|"~";
export type BGEXUnaryExpression = {
    type: BGEXUnaryExpressionType,
    target: BGEXExpression
}

export const parseUnaryExpression = (expr: UnaryExpression): BGEXUnaryExpression => {
    switch(expr.operator){
        case"!":case"~":
            return {
                type: expr.operator,
                target: parseExpression(expr.argument)
            }
        default:
            return serr(`${expr.operator} is not supported expression`, expr.start);
    }
}
