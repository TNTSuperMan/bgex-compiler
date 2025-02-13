import type { Statement } from "acorn";
import { serr } from "../util";
import { BGEXExpressionType, parseExpression, type BGEXExpression } from "./expr";
import { parseVariable, type BGEXVar } from "./var";

export const enum BGEXStatementType{
    var,
    expr,
    if,
    while
}

export type BGEXStatement = {
    type: BGEXStatementType.var,
    vars: BGEXVar[]
} | {
    type: BGEXStatementType.expr,
    expr: BGEXExpression
} | {
    type: BGEXStatementType.if,
    condition: BGEXExpression,
    true: BGEXStatement[],
    false?: BGEXStatement[]
} | {
    type: BGEXStatementType.while,
    condition: BGEXExpression,
    code: BGEXStatement[]
}

export const parseStatements = (statement: Statement): BGEXStatement[] => {
    switch(statement.type){
        case "BlockStatement":
            return statement.body.map(parseStatements).flat();
        case "ExpressionStatement":
            switch(statement.expression.type){
                case "CallExpression":
                case "AssignmentExpression":
                    return[{
                        type: BGEXStatementType.expr,
                        expr: parseExpression(statement.expression, true)
                    }]
                default:
                    return serr(`${statement.expression.type} is not statement`, statement.expression.start);
            }
        case "VariableDeclaration":
            return[{
                type: BGEXStatementType.var,
                vars: parseVariable(statement)
            }]
        case "IfStatement":
            return[{
                type: BGEXStatementType.if,
                condition: parseExpression(statement.test),
                true: parseStatements(statement.consequent),
                false: statement.alternate ? parseStatements(statement.alternate) : undefined
            }]
        case "WhileStatement":
            return[{
                type: BGEXStatementType.while,
                condition: parseExpression(statement.test),
                code: parseStatements(statement.body)
            }]
        case "ReturnStatement":
            const ret = statement.argument;
            return[{
                type: BGEXStatementType.expr,
                expr: {
                    type: BGEXExpressionType.call,
                    name: "ret",
                    args: ret ? [parseExpression(ret)] : []
                }
            }]
        default:
            return serr(`${statement.type} is not supported`, statement.start);
    }
}
