import { parse, type Expression, type SpreadElement } from "acorn"
import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { serr } from "../util"
import { parseFunction, type BGEXFunction } from "./func"
import { parseVariable, type BGEXVar } from "./var"
import type { BGEXScope } from "../compile"

export type MacroType = (scope: BGEXScope, ...args: (Expression|SpreadElement)[]) => string;

export type BGEXModule = {
    path: string,
    vars: BGEXVar[],
    funcs: BGEXFunction[],
    imports: {
        path: string,
        specifiers: [string, string][]
    }[],
    exportFunctions: BGEXFunction[],
    exportVariables: BGEXVar[],
    macro?: MacroType
}

export const parseBGEX = async(path: string): Promise<BGEXModule | undefined> => {
    if(!existsSync(path)) throw new Error(`${path} not found`)
    const src = readFileSync(path).toString()
    const token = parse(src, {ecmaVersion: "latest", sourceType: "module"});
    try{
        const imports: {
            path: string,
            specifiers: [string,string][]
        }[] = [];
        const exportFunctions: BGEXFunction[] = [];
        const exportVariables: BGEXVar[] = [];
        const funcs: BGEXFunction[] = [];
        const vars: BGEXVar[] = [];
        const macro: MacroType[] = [];

        await Promise.all(token.body.map(async e=>{
            switch(e.type){
                case "FunctionDeclaration":
                    funcs.push(parseFunction(e));
                    break;
                case "VariableDeclaration":
                    vars.push(...parseVariable(e));
                    break;
                case "ImportDeclaration":
                    const p = e.source.value;
                    if(typeof p == "string"){
                        const fullp = resolve(dirname(path), p)
                        if(!existsSync(fullp)) return serr(`Not found module: ${fullp}`, e.start);
                        if(e.specifiers.length){
                            imports.push({
                                path: fullp,
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
                        }else{
                            macro.push((await import(fullp)).default);
                        }
                    }
                    break;
                case "ExportNamedDeclaration":
                    if(!e.declaration) return serr("Need export declartion", e.start);
                    else switch(e.declaration.type){
                        case "FunctionDeclaration":
                            exportFunctions.push(parseFunction(e.declaration));
                            break;
                        case "VariableDeclaration":
                            exportVariables.push(...parseVariable(e.declaration));
                            break;
                        default:
                            return serr(`${e.type} is not supported export type`, e.start)
                    }
                    break;
                default:
                    return serr(`${e.type} is not supported`, e.start)
            }
        }));
        return {path, imports, funcs, vars, exportFunctions, exportVariables, macro: macro.at(-1)}
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