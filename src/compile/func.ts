import type { BGEXFunction } from "../parse/func";
import { ptr2asm } from "./util";
import { useVariable } from "./var";

export const compileFunc = (token: BGEXFunction, name?: string) => {
    const n = name ?? token.name;
    const args = token.args.map(useVariable);
    return`:${n}
${args.map(e=>`${ptr2asm(e[1])}`)}`
}