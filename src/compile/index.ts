import { readFileSync } from "node:fs";
import { toExportiveFunction, type Exports, type FunctionExport } from "../exportive";
import type { BGEXModule, MacroType } from "../parse";
import type { BGEXFunction } from "../parse/func";
import { compileFunc } from "./func";
import { escapeFunction } from "./util";
import { parseVariable, type Variable } from "./var";

export type BGEXScope = {
    vars: Map<string, Variable>[],
    funcs: Map<string, FunctionExport>,
    macro?: MacroType,
    path: string,
    getAt: (at: number) => [number, number]
}

export const compileBGEX = (token: BGEXModule, exports: Map<string, Exports>): string => {
    try{
        let asm = [`;@@ ${token.path}`];
        const source = readFileSync(token.path).toString();
        
        const scope: BGEXScope = {
            vars:[new Map],
            funcs: new Map,
            macro: token.macro,
            path: token.path,
            getAt: (at) => {
                let l = 1;
                let c = 1;
                for(let i = 0;i < at;i++){
                    if(source[i] == "\n"){
                        l++
                        c = 1;
                    }else{
                        c++
                    }
                }
                return [l,c];
            }
        };
        
        token.imports.forEach(e=>{
            const m = exports.get(e.path);
            if(!m) throw new ReferenceError("Not found module: " + e.path)
            e.specifiers.forEach(t=>{
                const res = m.find(e=>e[1] == t[0]);
                if(!res) throw new ReferenceError("Not found token: " + t[0]);
                if(res[0] == 0){
                    scope.funcs.set(res[1], res);
                }else{
                    scope.vars[0]?.set(res[1], res[2]);
                }
            })
        })
    
        const vars: Variable[] = token.vars.map(e=>parseVariable(scope, e));
        vars.forEach(e=>scope.vars[0]?.set(e[1], e));
    
        const fnmap: [BGEXFunction, `${string}-${string}-${string}-${string}-${string}`][] = token.funcs.map(e=>[e, crypto.randomUUID()]);
        fnmap.forEach(e=>scope.funcs.set(e[0].name, toExportiveFunction(e[0], e[1])))
        token.exportFunctions.forEach(e=>scope.funcs.set(e.name, toExportiveFunction(e, token.path)))
    
        asm.push(...fnmap.map(e => compileFunc(scope, e[0], escapeFunction(e[1], e[0].name))))
        asm.push(...token.exportFunctions.map(e => compileFunc(scope, e, escapeFunction(token.path, e.name))))
    
        return asm.join("\n");
    }catch(e){
        if(e instanceof Error){
            console.error(e);
            throw new Error(e.message + " at " + token.path);
        }else throw e;
    }
}
