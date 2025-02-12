import type { BGEXScope } from ".";
import type { BGEXFunction } from "../parse/func";
import { compileStatement } from "./statement";
import { ptr2asm } from "./util";
import { useVariable } from "./var";

export const compileFunc = (scope: BGEXScope,token: BGEXFunction, name?: string): string => {
    const n = name ?? token.name;
    const args = token.args.map(useVariable);

    const exprs: string[] = token.statements.map(e=>compileStatement(scope, e)).filter(e=>e!==undefined);
    scope.vars.push(new Map);
    scope.vars.pop();

    return`:fn_${n}${!args.length ? "" : `
; pop arguments
${args.map(e=>`/ ${ptr2asm(e[2])} store`).join("\n")}`}
${exprs.join("\n")}`
}