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

export const parseStatement = (statement: Statement): BGEXStatement => {
    if(statement.type == "ExpressionStatement"){
        switch(statement.expression.type){
            case "CallExpression":
            case "AssignmentExpression":
                return{
                    type: BGEXStatementType.expr,
                    expr: parseExpression(statement.expression)
                }
            default:
                return serr(`${statement.expression.type} is not statement`, statement.expression.start);
        }
    }else if(statement.type == "VariableDeclaration"){
        return{
            type: BGEXStatementType.var,
            vars: parseVariable(statement)
        }
    }else{
        return serr(`${statement.type} is not supported`, statement.start);
    }
}
