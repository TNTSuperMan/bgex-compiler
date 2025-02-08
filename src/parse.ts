import { parse, type Statement, type VariableDeclaration } from "acorn"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { BGEXExpressionType, parseExpression, type BGEXExpression } from "./expr"
import { serr } from "./util"

type BGEXModule = {
    path: string,
    statements: BGEXGlobalStatement[]
}

type BGEXGlobalStatement = 
    BGEXFunction | BGEXVar

type BGEXVar = {
    type: "var" | "let" | "const",
    name: string,
    isbig: boolean
    initial?: BGEXExpression
}

type BGEXFunction = {
    type: "function",
    name: string,
    args: string[],
    statements: (
        BGEXExpression | BGEXVar
    )[]
}

const parseVariable = (statement: VariableDeclaration): BGEXVar[] => 
    statement.declarations.map<BGEXVar>(t=>{
        const initial = t.init ? parseExpression(t.init) : void 0;
        return{
            type: statement.kind,
            name: t.id.type == "Identifier" ? t.id.name : serr(`${t.id.type} var define is not supported`, t.start),
            isbig: initial?.type == BGEXExpressionType.num ? initial.isbig : false,
            initial: initial
}})

const parseStatement = <T extends Statement>(statement: T): BGEXVar[] | BGEXExpression => {
    if(statement.type == "ExpressionStatement"){
        return parseExpression(statement.expression);
    }else if(statement.type == "VariableDeclaration"){
        return parseVariable(statement);
    }else{
        return serr(`${statement.type} is not supported`, statement.start);
    }
}

export const parseBGEX = (root: string, source: string): BGEXModule | undefined => {
    const path = resolve(root, source)
    const src = readFileSync(path).toString()
    const token = parse(src, {ecmaVersion: "latest", sourceType: "module"});
    try{
        return {
            path,
            statements: token.body.map((e):BGEXFunction | BGEXVar[] | void=>{
            switch(e.type){
                case "FunctionDeclaration":
                    return {
                        type: "function",
                        name: e.id.name,
                        args: e.params.map(e=>
                            e.type == "Identifier" ? e.name :
                            serr(`${e.type} Argument is not supported`, e.start)),
                        statements: e.body.body.map(e=>parseStatement(e)).flat()
                    }
                case "VariableDeclaration":
                    return parseVariable(e);
                case "ImportDeclaration":
                    return;
                default:
                    return serr(`${e.type} is not supported`, e.start)
            }
        }).filter(e=>e != undefined).flat()}
    }catch(e){
        if(e instanceof SyntaxError){
            if(typeof e.cause == "number"){
                let l = 1;
                let c = 1;
                for(let i = 0;i < e.cause;i++){
                    if(src[i] == "\n"){
                        l++
                        c = 1;
                    }else{
                        c++
                    }
                }
                console.error(`SyntaxError: ${e.message} at ${path}:${l}:${c}`)
                console.error(`Internal callstack: ${e.stack}`)
                return;
            }
        }
        throw e;
    }
}