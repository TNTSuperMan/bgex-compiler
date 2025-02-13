import { compileExpression } from ".";
import type { BGEXScope } from "..";
import type { BGEXUnaryExpression } from "../../parse/expr/unary";
import { bitNot, boolify, not } from "./binary";

export const compileUnaryExpression = (scope: BGEXScope, token: BGEXUnaryExpression) => {
    switch(token.type){
        case "!": return compileExpression(scope, token.target) + not + boolify;
        case "~": return bitNot(compileExpression(scope, token.target));
    }
}