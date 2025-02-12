import type { BGEXScope } from ".";
import type { BGEXFunction } from "../parse/func";
import { ptr2asm } from "./util";
import { useVariable } from "./var";

export const compileFunc = (scope: BGEXScope,token: BGEXFunction, name?: string) => {
    const n = name ?? token.name;
    const args = token.args.map(useVariable);

    scope.vars.push(new Map);
    scope.vars.pop();

    return`:fn_${n}
${args.map(e=>`${ptr2asm(e[2])}`)}`
}