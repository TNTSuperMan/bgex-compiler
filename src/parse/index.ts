import { parse, type Statement, type VariableDeclaration } from "acorn"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { BGEXExpressionType, parseExpression, type BGEXExpression } from "./expr"
import { serr } from "../util"
import { parseFunction, type BGEXFunction } from "./func"
import { parseVariable, type BGEXVar } from "./var"

export type BGEXModule = {
    path: string,
    statements: BGEXGlobalStatement[],
    imports: {
        path: string,
        specifiers: [string, string][]
    }[],
    exports: (BGEXFunction | BGEXVar)[]
}

type BGEXGlobalStatement = 
    BGEXFunction | BGEXVar

export const parseStatement = <T extends Statement>(statement: T): BGEXVar[] | BGEXExpression => {
    if(statement.type == "ExpressionStatement"){
        return parseExpression(statement.expression);
    }else if(statement.type == "VariableDeclaration"){
        return parseVariable(statement);
    }else{
        return serr(`${statement.type} is not supported`, statement.start);
    }
}

export const parseBGEX = (path: string): BGEXModule | undefined => {
    if(!existsSync(path)) throw new Error(`${path} not found`)
    const src = readFileSync(path).toString()
    const token = parse(src, {ecmaVersion: "latest", sourceType: "module"});
    try{
        const imports: {
            path: string,
            specifiers: [string,string][]
        }[] = [];
        const exports: (BGEXFunction | BGEXVar)[] = [];
        return {
            path,
            imports,
            exports,
            statements: token.body.map((e):BGEXFunction | BGEXVar[] | void=>{
            switch(e.type){
                case "FunctionDeclaration":
                    return parseFunction(e);
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
                case "ExportNamedDeclaration":
                    if(!e.declaration) return serr("Need export declartion", e.start);
                    else switch(e.declaration.type){
                        case "FunctionDeclaration":
                            exports.push(parseFunction(e.declaration));
                            break;
                        case "VariableDeclaration":
                            exports.push(...parseVariable(e.declaration));
                            break;
                        default:
                            return serr(`${e.type} is not supported export type`, e.start)
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