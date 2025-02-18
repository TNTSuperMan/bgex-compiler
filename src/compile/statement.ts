import type { BGEXScope } from ".";
import { BGEXStatementType, type BGEXStatement } from "../parse/statement";
import { compileExpression } from "./expr";
import { parseVariable } from "./var";

export const compileStatement = (scope: BGEXScope, token: BGEXStatement): string|void => {
    const t = crypto.randomUUID();
    switch(token.type){
        case BGEXStatementType.var:
            token.vars.forEach(e=>scope.vars.at(-1)?.set(e.name, parseVariable(e)));
            break;
        case BGEXStatementType.expr:
            return "/ " + compileExpression(scope, token.expr);
        case BGEXStatementType.if:
            return `;if
/ ${compileExpression(scope, token.condition)}
/ :if_true_${t} truejump
;if_false_${t}

${token.false?.map(e=>compileStatement(scope, e)).join("\n")}

/ :if_end_${t} jump
:if_true_${t}

${token.true.map(e=>compileStatement(scope, e)).join("\n")}

:if_end_${t}`
        case BGEXStatementType.while:
            return `;while
:while_start_${t}
/ ${compileExpression(scope, token.condition)}
/ :while_code_${t} truejump
/ :while_end_${t} jump

${token.code.map(e=>compileStatement(scope, e)).join("\n")}

/ :while_start_${t} jump
:while_end_${t}`
    }
}