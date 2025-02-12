import type { BGEXScope } from ".";
import { BGEXStatementType, type BGEXStatement } from "../parse/statement";
import { compileExpression } from "./expr";
import { parseVariable } from "./var";

export const compileStatements = (scope: BGEXScope, token: BGEXStatement) => {
    const t = crypto.randomUUID();
    switch(token.type){
        case BGEXStatementType.var:
            token.vars.forEach(e=>scope.vars.at(-1)?.set(e.name, parseVariable(e)));
            break;
        case BGEXStatementType.expr:
            return compileExpression(scope, token.expr);
            break;
        case BGEXStatementType.if:
            return `;if
;cond
/ :if_true_${t} truejump
; false
/ :if_end_${t} jump
:if_true_${t}
; true
:if_end`
        case BGEXStatementType.while:
            return `;while
:while_start_${t}
;cond
/ :while_code_${t} truejump
/ :while_end_${t} jump
;code
/ :while_start_${t} jump
:while_end_${t}
`
    }
}