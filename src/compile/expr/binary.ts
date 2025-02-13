import { compileExpression } from ".";
import type { BGEXScope } from "..";
import type { BGEXBinaryExpression } from "../../parse/expr/binary";

export const boolify = " 2 rem";
export const not = " 1 add";
const and = (a: string, b: string) => `${a}${boolify} ${b}${boolify} add 1 greater`;
const or = (a: string, b: string) => `${a}${boolify} ${b}${boolify} add 0 greater`;

export const bitNot = (a: string) => `${a} ${a} nand`;
const nand = (a:string,b:string) => `${a} ${b} nand`
type BitKey = "and" | "or" | "xor"
export const bit: {[key in BitKey]: ((a: string, b: string) => string)} = {
    and: (a,b) => bitNot(nand(a,b)),
    or: (a,b) => nand(bitNot(a), bitNot(b)),
    xor: (a,b) => nand(nand(a, nand(a, b)), nand(b, nand(a, b))) 
}

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
        case"&": return bit.and(
            compileExpression(scope, token.left),
            compileExpression(scope, token.right));
        case"|": return bit.or(
            compileExpression(scope, token.left),
            compileExpression(scope, token.right));
        case"^": return bit.xor(
            compileExpression(scope, token.left),
            compileExpression(scope, token.right));
        default: throw new Error("Not implemented binary expression: " + token.type)
    }
}