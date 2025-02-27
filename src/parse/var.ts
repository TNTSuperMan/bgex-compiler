import type { VariableDeclaration } from "acorn"
import { BGEXExpressionType, parseExpression, type BGEXExpression } from "./expr"
import { serr } from "../util"

export type BGEXVar = {
    name: string,
    isbig: boolean
    initial?: BGEXExpression,
    at: number
}


export const parseVariable = (statement: VariableDeclaration): BGEXVar[] => 
    statement.declarations.map<BGEXVar>(t=>{
        if(statement.kind == "const") return serr("Const var define is not supported", statement.start);
        const initial = t.init ? parseExpression(t.init) : void 0;
        return{
            name: t.id.type == "Identifier" ? t.id.name : serr(`${t.id.type} var define is not supported`, t.start),
            isbig: initial?.type == BGEXExpressionType.num ? initial.isbig : false,
            initial: initial,
            at: t.start
}})
