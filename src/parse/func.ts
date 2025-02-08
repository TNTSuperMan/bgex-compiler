import type { FunctionDeclaration } from "acorn";
import { serr } from "../util";
import { parseStatement } from ".";
import type { BGEXExpression } from "./expr";
import type { BGEXVar } from "./var";

export type BGEXFunction = {
    type: "function",
    name: string,
    args: string[],
    statements: (
        BGEXExpression | BGEXVar
    )[]
}

export const parseFunction = (token: FunctionDeclaration): BGEXFunction => ({
    type: "function",
    name: token.id.name,
    args: token.params.map(e=>
        e.type == "Identifier" ? e.name :
        serr(`${e.type} Argument is not supported`, e.start)),
    statements: token.body.body.map(e=>parseStatement(e)).flat()
})