import type { FunctionDeclaration } from "acorn";
import { serr } from "../util";
import { parseStatement, type BGEXStatement } from "./statement";

export type BGEXFunction = {
    type: "function",
    name: string,
    args: string[],
    statements: BGEXStatement[]
}

export const parseFunction = (token: FunctionDeclaration): BGEXFunction => ({
    type: "function",
    name: token.id.name,
    args: token.params.map(e=>
        e.type == "Identifier" ? e.name :
        serr(`${e.type} Argument is not supported`, e.start)),
    statements: token.body.body.map(parseStatement).flat()
})