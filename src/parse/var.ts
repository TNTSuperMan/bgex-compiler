import type { VariableDeclaration } from "acorn"
import { BGEXExpressionType, parseExpression, type BGEXExpression } from "./expr"
import { serr } from "../util"

export type BGEXVar = {
    type: "var" | "let" | "const",
    name: string,
    isbig: boolean
    initial?: BGEXExpression
}


export const parseVariable = (statement: VariableDeclaration): BGEXVar[] => 
    statement.declarations.map<BGEXVar>(t=>{
        const initial = t.init ? parseExpression(t.init) : void 0;
        return{
            type: statement.kind,
            name: t.id.type == "Identifier" ? t.id.name : serr(`${t.id.type} var define is not supported`, t.start),
            isbig: initial?.type == BGEXExpressionType.num ? initial.isbig : false,
            initial: initial
}})
