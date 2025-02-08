import type { BGEXModule } from "../parse";
import { parseVariable, type Variable } from "./var";

export const compileBGEX = (token: BGEXModule): [string, Variable[]] => {
    let asm = [`;${token.path}`];
    const expVars: Variable[] = token.exportVariables.map(parseVariable);
    asm.push(...expVars.map(e=>e[0]?e[4]:e[3]));

    const vars: Variable[] = token.vars.map(parseVariable);
    asm.push(...vars.map(e=>e[0]?e[4]:e[3]));

    const fnmap: Map<string, string> = new Map;
    token.funcs.forEach(e=>
        fnmap.set(e.name, e.name + crypto.randomUUID()))


    return [asm.join("\n"), expVars];
}
