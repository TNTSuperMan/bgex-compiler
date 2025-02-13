import type { BinaryExpression, LogicalExpression } from "acorn"
import { parseExpression, type BGEXExpression } from "."
import { serr } from "../../util";

export type BGEXBinaryExpressionType =
    "+"|"-"|"*"|"/"|"%"|"&"|"|"|"^"|"=="|"==="|"!="|"!=="|">"|">="|"<"|"<="|"&&"|"||";
export type BGEXBinaryExpression = {
    type: BGEXBinaryExpressionType,
    left: BGEXExpression,
    right: BGEXExpression
}

export const parseBinaryExpression = (expr: BinaryExpression|LogicalExpression): BGEXBinaryExpression => {
    if(expr.left.type == "PrivateIdentifier") throw new Error(`unknown expr: Private Identifier: ${expr.left.name}`)
    switch(expr.operator){
        case"<<":case">>":case">>>":case"in":case"instanceof":case"**":case"??":
            return serr(`${expr.operator} is not supported expression`, expr.start)
    }
    return {
        type: expr.operator,
        left: parseExpression(expr.left),
        right: parseExpression(expr.right)
    }
}
