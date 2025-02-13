import { compileExpression } from ".";
import type { BGEXScope } from "..";
import type { BGEXBinaryExpression } from "../../parse/expr/binary";

const boolify = " 2 rem";
const not = " 1 add";
const and = (a: string, b: string) => `${a}${boolify} ${b}${boolify} add 1 greater`;
const or = (a: string, b: string) => `${a}${boolify} ${b}${boolify} add 0 greater`;

export const compileBinaryExpression = (scope: BGEXScope, token: BGEXBinaryExpression): string => {
    const base = `${compileExpression(scope, token.left)} ${compileExpression(scope, token.right)} `;
    switch(token.type){
        case"+": return base + "add";
        case"-": return base + "sub";
        case"*": return base + "mul";
        case"/": return base + "div";
        case"%": return base + "rem";
        case"==": case"===": return base + "equal" + boolify;
        case"!=": case"!==": return base + "equal" + not + boolify;
        case">": return base + "greater";
        case">=":return or(base + "greater", base + "equal");
        case"<": return base + "greater" + not + boolify;
        case"<=":return or(base + "greater" + not, base + "equal");
        default: throw new Error("Not implemented binary expression: " + token.type)
    }
}