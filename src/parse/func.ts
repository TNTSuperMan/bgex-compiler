import type { FunctionDeclaration } from "acorn";
import { serr } from "../util";
import { parseStatements, type BGEXStatement } from "./statement";
import type { BGEXVar } from "./var";

export type BGEXFunction = {
    type: "function",
    name: string,
    args: BGEXVar[],
    statements: BGEXStatement[]
}

export const parseFunction = (token: FunctionDeclaration): BGEXFunction => ({
    type: "function",
    name: token.id.name,
    args: token.params.map<BGEXVar>(e=>
        e.type == "Identifier" ?
            {name: e.name, isbig: false, at: e.start} :
            e.type == "AssignmentPattern" ?
                e.left.type == "Identifier" ?
                    {name: e.left.name, isbig: true, at: e.left.start} :
                    serr(`${e.left.type} assign argument is not supported`, e.left.start) :
            serr(`${e.type} argument is not supported`, e.start)),
    statements: token.body.body.map(parseStatements).flat()
})