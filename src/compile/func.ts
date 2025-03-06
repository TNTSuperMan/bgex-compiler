import type { BGEXScope } from ".";
import type { BGEXFunction } from "../parse/func";
import { compileStatement } from "./statement";
import { ptr2asm } from "./util";
import { parseVariable } from "./var";

export const compileFunc = (scope: BGEXScope,token: BGEXFunction, name?: string): string => {
    const n = name ?? token.name;
    const args = token.args.map(e=>parseVariable(scope, e));

    scope.vars.push(new Map);
    args.forEach(e=>scope.vars.at(-1)?.set(e[1], e));

    const exprs: string[] = token.statements.map(e=>compileStatement(scope, e)).filter(e=>e!==undefined);

    scope.vars.pop();

    const argPoper = `; pop arguments
${args.toReversed().map(e=>e[0] ?
    `/ ${ptr2asm(e[3])} store ${ptr2asm(e[2])} store`:
    `/ ${ptr2asm(e[2])} store`).join("\n")}`;

    return`:fn_${n}
${args.length ? argPoper : ""}
${exprs.join("\n")}`
}