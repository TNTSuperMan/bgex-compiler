import { parse, type Statement, type VariableDeclaration } from "acorn"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { BGEXExpressionType, parseExpression, type BGEXExpression } from "./expr"
import { serr } from "../util"

type BGEXModule = {
    path: string,
    statements: BGEXGlobalStatement[],
    imports: {
        path: string,
        specifiers: [string, string][]
    }[]
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
    if(!existsSync(path)) throw new Error(`${path} not found`)
    const src = readFileSync(path).toString()
    const token = parse(src, {ecmaVersion: "latest", sourceType: "module"});
    try{
        const imports: {
            path: string,
            specifiers: [string,string][]
        }[] = [];
        return {
            path,
            imports,
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
                    const p = e.source.value;
                    if(typeof p == "string"){
                        const fullp = resolve(dirname(path), p)
                        if(existsSync(fullp)) return serr(`Not found module: ${fullp}`, e.start);
                        imports.push({
                            path: p,
                            specifiers: e.specifiers.map(e=>{
                                if(e.type == "ImportSpecifier"){
                                    if(e.imported.type == "Identifier"){
                                        return [e.imported.name, e.local.name]
                                    }else{
                                        return serr(`Cannot import ${e.imported.type} value`, e.start);
                                    }
                                }else{
                                    return serr(`Cannot import ${e.type}`, e.start);
                                }
                            })
                        })
                    }
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