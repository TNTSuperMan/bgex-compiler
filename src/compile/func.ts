import type { BGEXScope } from ".";
import type { BGEXFunction } from "../parse/func";
import { BGEXStatementType } from "../parse/statement";
import { compileExpression } from "./expr";
import { ptr2asm } from "./util";
import { parseVariable, useVariable } from "./var";

export const compileFunc = (scope: BGEXScope,token: BGEXFunction, name?: string): string => {
    const n = name ?? token.name;
    const args = token.args.map(useVariable);

    const exprs: string[] = [];
    scope.vars.push(new Map);
    token.statements.forEach(e=>{
        switch(e.type){
            case BGEXStatementType.var:
                e.vars.forEach(e=>scope.vars.at(-1)?.set(e.name, parseVariable(e)));
                break;
            case BGEXStatementType.expr:
                exprs.push(compileExpression(scope, e.expr));
                break;
            default:
                throw new Error("not implemented")
        }
    })
    scope.vars.pop();

    return`:fn_${n}
${args.map(e=>`${ptr2asm(e[2])}`)}
${exprs.join("\n")}`
}