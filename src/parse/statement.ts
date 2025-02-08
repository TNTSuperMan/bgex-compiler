import type { Statement } from "acorn";
import { serr } from "../util";
import { parseExpression, type BGEXExpression } from "./expr";
import { parseVariable, type BGEXVar } from "./var";

export const enum BGEXStatementType{
    var,
    expr,
    if,
    while
}

export type BGEXStatement = {
    type: BGEXStatementType.var,
    var: BGEXVar
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

export const parseStatement = (statement: Statement): BGEXVar[] | BGEXExpression => {
    if(statement.type == "ExpressionStatement"){
        return parseExpression(statement.expression);
    }else if(statement.type == "VariableDeclaration"){
        return parseVariable(statement);
    }else{
        return serr(`${statement.type} is not supported`, statement.start);
    }
}
